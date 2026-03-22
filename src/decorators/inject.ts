import type { InjectMetadata } from '@/@types';
import { INJECT } from '@/config';
import { Types } from '@/enum';

type InjectType = Types | ((param: string) => any);

/**
 * 注入装饰器，用于注入路由参数
 * @param paramName 参数名
 * @param type 参数类型，默认不转换，可以传入 Types 枚举值或自定义转换函数
 */
export function Inject(paramName: string, type?: InjectType) {
	return (target: any, propertyKey: string, parameterIndex: number) => {
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
 * 上下文装饰器，用于注入 `Koa.Context`
 */
export function Context() {
	return (target: any, propertyKey: string, parameterIndex: number) => {
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
