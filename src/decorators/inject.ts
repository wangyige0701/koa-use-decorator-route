import type { InjectMetadata, InjectMethodMetadata } from '@/@types';
import { INJECT, INJECT_METHOD } from '@/config';
import { Types } from '@/enum';
import { isFunction } from '@/utils';

type InjectType = Types | ((param: string) => any);

/**
 * 注入装饰器，用于注入实例
 *
 * Inject decorator, used to inject instances
 *
 * @param constructor 需要注入的构造函数，不传时通过类型反射获取 / default is to reflect type
 */
export function Inject(constructor?: Function): PropertyDecorator;
/**
 * 注入装饰器，用于注入路由参数
 *
 * Inject decorator, used to inject route parameters
 *
 * @param paramName 参数名
 * @param type 参数类型，默认不转换，可以传入 Types 枚举值或自定义转换函数
 */
export function Inject(paramName: string, type?: InjectType): ParameterDecorator;
export function Inject(...args: any[]): PropertyDecorator | ParameterDecorator {
	// 如果没有传入参数，或者第一个参数是函数，则表示注入属性实例
	if (args.length === 0 || isFunction(args[0])) {
		return (target: any, propertyKey: string | symbol) => {
			const inject = args[0] || Reflect.getMetadata('design:type', target, propertyKey);
			if (!inject) {
				return;
			}

			const injections = (Reflect.getMetadata(INJECT_METHOD, target.constructor) || []) as InjectMethodMetadata[];

			injections.push({
				propertyKey,
				inject,
			});

			Reflect.defineMetadata(INJECT_METHOD, injections, target.constructor);
		};
	}
	// 如果传入了参数，且第一个参数是字符串，则表示注入路由参数
	return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
		if (!propertyKey) {
			return;
		}

		const [paramName, type] = args as [string, InjectType?];
		if (typeof paramName !== 'string') {
			return;
		}

		const inject = (Reflect.getMetadata(INJECT, target.constructor, propertyKey) || []) as InjectMetadata[];

		inject.push({
			paramName,
			type,
			parameterIndex,
		});

		Reflect.defineMetadata(INJECT, inject, target.constructor, propertyKey);
	};
}

/**
 * 上下文装饰器，用于注入 `Koa.Context`，只能用作参数装饰器, 且只能注入一次
 *
 * Context decorator, used to inject Koa.Context, can only be used as parameter decorator, and can only be used once per method
 */
export function Context(): ParameterDecorator {
	return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
		if (!propertyKey) {
			return;
		}

		const injects = (Reflect.getMetadata(INJECT, target.constructor, propertyKey) || []) as InjectMetadata[];

		if (injects.find((item) => item.isContext)) {
			return;
		}

		injects.push({
			isContext: true,
			paramName: 'ctx',
			parameterIndex,
		});
		injects.sort((a, b) => a.parameterIndex - b.parameterIndex);

		Reflect.defineMetadata(INJECT, injects, target.constructor, propertyKey);
	};
}
