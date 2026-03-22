import type { AllowedMethodsOptions } from '@koa/router';
import type { Methods, Types } from '@/enum';

export interface DecoratorsOptions {
	/**
	 * 控制器目录绝对路径
	 *
	 * Controller directory absolute path
	 */
	controllerDir: string;
	/**
	 * 允许的请求方法，可以传 `@koa/router` 的 `allowedMethods` 参数
	 *
	 * Allowed request methods
	 */
	allowedMethods?: boolean | AllowedMethodsOptions;
}

export interface ControllerMethod {
	path: string;
	method: Methods;
	handler: string;
}

export interface InjectMetadata {
	isContext?: boolean;
	paramName: string;
	type?: Types | ((param: string) => any);
	parameterIndex: number;
}

export interface ResponseHeaderMetadata {
	header: string;
	value: string;
}

export type RouteMethods = 'all' | 'get' | 'post' | 'put' | 'delete' | 'options' | 'head';

export type ExposeMethods = Capitalize<RouteMethods>;
