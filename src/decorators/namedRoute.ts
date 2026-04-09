import { ROUTE_NAME } from '@/config';

/**
 * 创建一个命名路由装饰器
 *
 * Create a named route decorator.
 *
 * @param name 路由名称 / route name
 */
export function NamedRoute(name: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		if (name) {
			Reflect.defineMetadata(ROUTE_NAME, name, target.constructor, propertyKey);
		}
		return descriptor;
	};
}
