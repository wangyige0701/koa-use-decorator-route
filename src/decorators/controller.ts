import { CONTROLLER, ROUTE_OVERRIDE, SINGLETON } from '@/config';

/**
 * 控制器装饰器
 *
 * Controller decorator
 *
 * @param basePath 控制器基础路径
 */
export function Controller(basePath: string): ClassDecorator {
	return (target: any) => {
		Reflect.defineMetadata(CONTROLLER, basePath, target);
		return target;
	};
}

/**
 * 单例模式装饰器
 *
 * Singleton pattern decorator
 */
export function Singleton(...params: any[]): ClassDecorator {
	return (target: any) => {
		let instance: any = null;
		if (!Reflect.hasMetadata(SINGLETON, target)) {
			Reflect.defineMetadata(
				SINGLETON,
				() => {
					if (!instance) {
						instance = new target(...params);
					}
					return instance;
				},
				target,
			);
		}
		return target;
	};
}

/**
 * 控制器基础路径覆写装饰器，可以使指定路由的路径不包含控制器基础路径
 *
 * Controller base path override decorator, can make the route path not contain the controller base path
 */
export function ControllerBasePathOverride(): MethodDecorator {
	return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(ROUTE_OVERRIDE, true, target.constructor, propertyKey);
		return descriptor;
	};
}
