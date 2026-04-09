import { ROUTE_MIDDLEWARES } from '@/config';
import type { Middleware } from 'koa';

/**
 * 创建一个中间件装饰器
 *
 * Create a middleware decorator.
 *
 * @param callback 中间件函数 / middleware function
 */
export function createMiddlewareDecorator(callback: Middleware): ClassDecorator;
export function createMiddlewareDecorator(callback: Middleware): MethodDecorator;
export function createMiddlewareDecorator(callback: Middleware): ClassDecorator | MethodDecorator {
	return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
		if (!propertyKey) {
			const middlewares = (Reflect.getMetadata(ROUTE_MIDDLEWARES, target) || []) as Middleware[];
			middlewares.push(callback);
			Reflect.defineMetadata(ROUTE_MIDDLEWARES, middlewares, target);
			return target;
		}

		const middlewares = (Reflect.getMetadata(ROUTE_MIDDLEWARES, target.constructor, propertyKey) ||
			[]) as Middleware[];
		middlewares.push(callback);
		Reflect.defineMetadata(ROUTE_MIDDLEWARES, middlewares, target.constructor, propertyKey);
		return descriptor;
	};
}

export function Middleware(callback: Middleware): ClassDecorator | MethodDecorator {
	return createMiddlewareDecorator(callback);
}
