import type Router from '@koa/router';
import type {
	ControllerMethod,
	InjectMethodMetadata,
	MatchDirectory,
	ResponseHeaderMetadata,
	RouteMethods,
} from '@/@types';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
	CONTROLLER,
	INJECT_METHOD,
	RESPONSE_GLOBAL_HEADER,
	RESPONSE_HEADER,
	ROUTE_OVERRIDE,
	ROUTES,
	SINGLETON,
} from '@/config';
import { ControllerDirNotExist } from '@/error';
import { isArray, isFunction, isRegExp, isString } from '@/utils';

/**
 * 初始化路由
 * @param route Router 实例
 * @param controllerDir 控制器目录路径
 * @param match 匹配规则
 * @param acceptAnyControllerName 是否允许任何控制器文件名，默认 false
 */
export async function initialize(
	router: Router,
	controllerDir: string,
	match?: MatchDirectory,
	acceptAnyControllerName: boolean = false,
) {
	if (!fs.existsSync(controllerDir) || !fs.statSync(controllerDir).isDirectory()) {
		throw new Error(ControllerDirNotExist(controllerDir));
	}

	const matchRule = handleMatchRules(match);
	const files = fs.readdirSync(controllerDir);
	for (const file of files) {
		if (!acceptAnyControllerName && !/^[\w]+Controller\.(m|c)?(js|ts)$/.test(file)) {
			continue;
		}

		// 筛选文件名
		if (isFunction(matchRule) && !matchRule(path.basename(file, path.extname(file)), path.extname(file))) {
			continue;
		}

		const fileUrl = pathToFileURL(path.resolve(controllerDir, file)).href;
		const controller = (await import(fileUrl)) as Record<string, any>;
		for (const controllerClass of Object.values(controller)) {
			// 过滤非法类型，确保是类或函数
			if (!isTarget(controllerClass)) {
				continue;
			}
			// 一定要包含 Controller 装饰器声明
			const controllerPath = Reflect.getMetadata(CONTROLLER, controllerClass) as string;
			if (!isString(controllerPath) || !controllerPath) {
				continue;
			}

			// 是否覆写控制器基础路径
			const isOverrideControllerPath = Reflect.getMetadata(ROUTE_OVERRIDE, controllerClass) || false;
			const routes = (Reflect.getMetadata(ROUTES, controllerClass) || []) as ControllerMethod[];
			for (const routeItem of routes) {
				// 只在设置 route 时重写一次函数体，避免嵌套过多
				// 覆写控制器基础路径时，将 base 设置为根路径
				const _base = getBasePath(controllerPath, isOverrideControllerPath);
				const _path = getRoutePath(routeItem);
				// 路径规则整理，确保路径以 / 开头，避免重复
				const path = _base + (_path === '/' ? '' : _path);
				const method = routeItem.method.toLowerCase() as RouteMethods;
				const handler = routeItem.handler;

				router[method](path, async (ctx) => {
					const responseHeaders = (Reflect.getMetadata(RESPONSE_HEADER, controllerClass, handler) ||
						[]) as ResponseHeaderMetadata[];
					const responseHeaderGlobal = (Reflect.getMetadata(RESPONSE_GLOBAL_HEADER, controllerClass) ||
						[]) as ResponseHeaderMetadata[];

					// 合并全局响应头和方法响应头，去重
					const _global = responseHeaderGlobal.filter(
						(item) => !responseHeaders.find((header) => header.header === item.header),
					);
					for (const header of [..._global, ...responseHeaders]) {
						ctx.set(header.header, header.value);
					}

					// 单例判断
					const instance = toInjectMethodMetadata<any>(controllerClass, getSingleton(controllerClass));
					ctx.body = await instance[handler].call(instance, ctx);
				});
			}
		}
	}
}

function getBasePath(controllerPath: string, isOverrideControllerPath: boolean) {
	return isOverrideControllerPath ? '/' : controllerPath.endsWith('/') ? controllerPath.slice(0, -1) : controllerPath;
}

function getRoutePath(routeItem: ControllerMethod) {
	return isString(routeItem.path) && routeItem.path
		? !routeItem.path.startsWith('/')
			? '/'
			: '' + routeItem.path
		: '/';
}

function isTarget(val: any): val is Function {
	return typeof val === 'object' ? val !== null : typeof val === 'function';
}

/**
 * 处理控制器方法的依赖注入
 *
 * @param cls 控制器类
 * @param instance 实例对象
 */
function toInjectMethodMetadata<T extends Object>(cls: Function, instance: T): T {
	const injections = (Reflect.getMetadata(INJECT_METHOD, cls) || []) as InjectMethodMetadata[];
	if (!injections.length) {
		return instance;
	}

	const isSingleton = Reflect.hasMetadata(SINGLETON, cls);
	if (isSingleton && Reflect.hasMetadata(SINGLETON, instance)) {
		return instance;
	}

	for (const injection of injections) {
		const { propertyKey, inject } = injection;
		if (!isTarget(inject)) {
			continue;
		}
		// 注入的实例判断是否设置了单例装饰器
		instance[propertyKey as keyof typeof instance] = getSingleton(inject);
	}

	if (isSingleton) {
		// 单例构造函数实例在注入完成后设置标识，避免重复注入
		Reflect.defineMetadata(SINGLETON, true, instance);
	}

	return instance;
}

/**
 * 获取单例实例，如果没有设置单例装饰器，则返回新实例
 * @param cls 控制器类
 */
function getSingleton(cls: Function & (new (...args: any[]) => any)) {
	if (Reflect.hasMetadata(SINGLETON, cls)) {
		const singleton = Reflect.getMetadata(SINGLETON, cls);
		if (isFunction(singleton)) {
			return singleton();
		}
	}
	return new cls();
}

function handleMatchRules(match?: MatchDirectory) {
	return isFunction(match)
		? match
		: (() => {
				if (!match) {
					return false;
				}
				const rules = isArray(match) ? match : [match];
				const useRule = rules
					.filter((item) => isString(item) || isRegExp(item))
					.map((item) => {
						if (isString(item)) {
							return (val: string) => val === item;
						}
						return (val: string) => item.test(val);
					});
				return (val: string, suffix?: string) => useRule.some((item) => item(val));
			})();
}
