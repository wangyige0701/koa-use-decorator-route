import 'reflect-metadata/lite';

import type { Middleware } from 'koa';
import type {
	ControllerMethod,
	DecoratorsOptions,
	InjectMethodMetadata,
	ResponseHeaderMetadata,
	RouteMethods,
} from './@types';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Router from '@koa/router';
import {
	CONTROLLER,
	INJECT_METHOD,
	RESPONSE_GLOBAL_HEADER,
	RESPONSE_HEADER,
	ROUTE_OVERRIDE,
	ROUTES,
	SINGLETON,
} from './config';

export function decorator(options: DecoratorsOptions): Middleware {
	const route = new Router();

	return async (ctx, next) => {
		const { controllerDir, allowedMethods } = options || {};
		if (!controllerDir) {
			throw new Error('controllerDir is required with the absolute path');
		}

		if (!fs.existsSync(controllerDir) || !fs.statSync(controllerDir).isDirectory()) {
			throw new Error(`controller directory ${controllerDir} not exists`);
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
				if (
					typeof controllerClass === 'object'
						? controllerClass === null
						: typeof controllerClass !== 'function'
				) {
					continue;
				}
				// 一定要包含 Controller 装饰器声明
				const controllerPath = Reflect.getMetadata(CONTROLLER, controllerClass) as string;
				if (typeof controllerPath !== 'string' || !controllerPath) {
					continue;
				}

				// 是否覆写控制器基础路径
				const isOverrideControllerPath = Reflect.getMetadata(ROUTE_OVERRIDE, controllerClass) || false;
				const routes = (Reflect.getMetadata(ROUTES, controllerClass) || []) as ControllerMethod[];
				for (const routeItem of routes) {
					// 只在设置 route 时重写一次函数体，避免嵌套过多
					// 覆写控制器基础路径时，将 base 设置为根路径
					const _base = isOverrideControllerPath
						? '/'
						: controllerPath.endsWith('/')
							? controllerPath.slice(0, -1)
							: controllerPath;
					const _path = !routeItem.path.startsWith('/') ? '/' : '' + routeItem.path;
					// 路径规则整理，确保路径以 / 开头，避免重复 / 问题
					const path = _base + (_path === '/' ? '' : _path);
					const method = routeItem.method.toLowerCase() as RouteMethods;
					const handler = routeItem.handler;

					// 单例成员注入属性
					if (Reflect.hasMetadata(SINGLETON, controllerClass)) {
						toInjectMethodMetadata<any>(controllerClass, Reflect.getMetadata(SINGLETON, controllerClass));
					}

					route[method](path, async (ctx) => {
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

		ctx.app.use(route.routes());
		if (typeof allowedMethods === 'boolean') {
			if (allowedMethods) {
				ctx.app.use(route.allowedMethods());
			}
		} else if (allowedMethods) {
			ctx.app.use(route.allowedMethods(allowedMethods));
		}

		await next();
	};
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
		if (typeof inject !== 'function') {
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

export * from '@/decorators/action';
export * from '@/decorators/response';
export * from '@/decorators/controller';
export * from '@/decorators/inject';
export * from '@/decorators/if';

export { Types, Methods } from './enum';
