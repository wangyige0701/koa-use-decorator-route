import type Koa from 'koa';
import type { ControllerMethod, ExposeMethods, InjectMetadata } from '@/@types';
import { INJECT, ROUTES } from '@/config';
import { Methods, Types } from '@/enum';
import { isFunction } from '@/utils';

const TypeMapFunction = {
	[Types.Int]: (param: string) => parseInt(param, 10) || 0,
	[Types.Float]: (param: string) => parseFloat(param) || 0,
	[Types.String]: (param: string) => String(param),
	[Types.Boolean]: (param: string) => param === 'true',
};

function Action(path: string, method: Methods): MethodDecorator {
	return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		const routes = Reflect.getMetadata(ROUTES, target.constructor) || ([] as ControllerMethod[]);

		const oldValue = descriptor.value;
		descriptor.value = async function (ctx: Koa.Context) {
			const injects = (Reflect.getMetadata(INJECT, target.constructor, propertyKey) || []) as InjectMetadata[];

			// 整理传入参数
			const params = ctx.params;
			const injectParams = [];
			for (const inject of injects) {
				if (inject.isContext) {
					injectParams[inject.parameterIndex] = ctx;
					continue;
				}
				let param = params[inject.paramName] ?? void 0;
				if (typeof inject.type === 'string') {
					// 默认类型转换
					if (TypeMapFunction[inject.type]) {
						param = TypeMapFunction[inject.type](param);
					}
				} else if (isFunction(inject.type)) {
					param = inject.type(param);
				}
				injectParams[inject.parameterIndex] = param;
			}

			return await oldValue.apply(this, injectParams);
		};

		routes.push({
			path: path,
			method: method,
			handler: propertyKey,
		});

		Reflect.defineMetadata(ROUTES, routes, target.constructor);

		return descriptor;
	};
}

const methods = Object.values(Methods).map(
	(item) => item.slice(0, 1).toUpperCase() + item.slice(1).toLowerCase(),
) as unknown as ExposeMethods[];

type HttpMethodFunc = (path: string) => ReturnType<typeof Action>;

export const HttpMethod = methods.reduce(
	(prev, curr) => {
		prev[curr] = (path: string) => Action(path, Methods[curr.toUpperCase() as keyof typeof Methods]);
		return prev;
	},
	{} as Record<ExposeMethods, HttpMethodFunc>,
);
