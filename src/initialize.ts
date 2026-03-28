import type Router from '@koa/router';
import type { ControllerMethod, InjectMethodMetadata, ResponseHeaderMetadata, RouteMethods } from '@/@types';
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
import { isString } from '@/utils';

/**
 * 初始化路由
 * @param route Router 实例
 * @param controllerDir 控制器目录路径
 */
export async function initialize(router: Router, controllerDir: string) {
	if (!fs.existsSync(controllerDir) || !fs.statSync(controllerDir).isDirectory()) {
		throw new Error(ControllerDirNotExist(controllerDir));
	}

	const files = fs.readdirSync(controllerDir);
	for (const file of files) {
		if (!/^[\w]+Controller\.(m|c)?(js|ts)$/.test(file)) {
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

				// 单例成员注入属性
				if (Reflect.hasMetadata(SINGLETON, controllerClass)) {
					toInjectMethodMetadata<any>(controllerClass, Reflect.getMetadata(SINGLETON, controllerClass));
				}

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
					if (Reflect.hasMetadata(SINGLETON, controllerClass)) {
						const singleton = Reflect.getMetadata(SINGLETON, controllerClass);
						ctx.body = await singleton[handler].call(singleton, ctx);
					} else {
						const instance = toInjectMethodMetadata<any>(controllerClass, new controllerClass());
						ctx.body = await instance[handler].call(instance, ctx);
					}
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

	for (const injection of injections) {
		const { propertyKey, inject } = injection;
		if (!isTarget(inject)) {
			continue;
		}
		// 注入的实例判断是否设置了单例装饰器
		if (Reflect.hasMetadata(SINGLETON, inject)) {
			instance[propertyKey as keyof typeof instance] = Reflect.getMetadata(SINGLETON, inject);
		} else {
			instance[propertyKey as keyof typeof instance] = new inject();
		}
	}

	return instance;
}
