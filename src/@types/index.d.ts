import type { AllowedMethodsOptions } from '@koa/router';
import type { HttpMethods, Types } from '@/enum';

export interface DecoratorsOptions {
	/**
	 * 控制器目录绝对路径
	 */
	controllerDir: string;
	allowedMethods?: boolean | AllowedMethodsOptions;
}

export interface ControllerMethod {
	path: string;
	method: HttpMethods;
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
