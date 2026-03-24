import 'reflect-metadata/lite';

import type { Middleware } from 'koa';
import type { ControllerMethod, DecoratorsOptions, ResponseHeaderMetadata, RouteMethods } from './@types';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Router from '@koa/router';
import { CONTROLLER, RESPONSE_GLOBAL_HEADER, RESPONSE_HEADER, ROUTE_OVERRIDE, ROUTES, SINGLETON } from './config';

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
					// 保证
					const path = _base + (_path === '/' ? '' : _path);
					const method = routeItem.method.toLowerCase() as RouteMethods;
					const handler = routeItem.handler;

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

						if (Reflect.hasMetadata(SINGLETON, controllerClass)) {
							const singleton = Reflect.getMetadata(SINGLETON, controllerClass);
							ctx.body = await singleton[handler](ctx);
						} else {
							ctx.body = await new controllerClass()[handler](ctx);
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

export * from '@/decorators/action';
export * from '@/decorators/response';
export * from '@/decorators/controller';
export * from '@/decorators/inject';
export * from '@/decorators/if';

export { Types, Methods } from './enum';
