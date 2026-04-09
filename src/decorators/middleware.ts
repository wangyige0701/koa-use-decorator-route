import type { Middleware } from 'koa';
import { ROUTE_MIDDLEWARES } from '@/config';

/**
 * 创建一个中间件装饰器
 *
 * Create a middleware decorator.
 *
 * @param middlewares 中间件函数 / middleware functions
 */
export function createMiddlewareDecorator(...middlewares: Middleware[]): ClassDecorator;
export function createMiddlewareDecorator(...middlewares: Middleware[]): MethodDecorator;
export function createMiddlewareDecorator(...middlewares: Middleware[]): ClassDecorator | MethodDecorator {
	return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
		if (!propertyKey) {
			const middlewaresList = (Reflect.getMetadata(ROUTE_MIDDLEWARES, target) || []) as Middleware[];
			middlewaresList.push(...middlewares);
			Reflect.defineMetadata(ROUTE_MIDDLEWARES, middlewaresList, target);
			return target;
		}

		const middlewaresList = (Reflect.getMetadata(ROUTE_MIDDLEWARES, target.constructor, propertyKey) ||
			[]) as Middleware[];
		middlewaresList.push(...middlewares);
		Reflect.defineMetadata(ROUTE_MIDDLEWARES, middlewaresList, target.constructor, propertyKey);
		return descriptor;
	};
}

/**
 * 路由中间件装饰器
 *
 * Route middleware decorator.
 *
 * @param middlewares 中间件函数 / middleware functions
 */
export function RouteMiddleware(...middlewares: Middleware[]): ClassDecorator | MethodDecorator {
	return createMiddlewareDecorator(...middlewares);
}
