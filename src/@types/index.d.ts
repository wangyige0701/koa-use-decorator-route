import type { AllowedMethodsOptions } from '@koa/router';
import type { Methods, Types } from '@/enum';

export interface DecoratorOptions {
	/**
	 * 控制器目录绝对路径
	 *
	 * Controller directory absolute path
	 *
	 * TODO: 考虑支持多个目录导入，不只包含控制器目录
	 */
	controllerDir: string;
	/**
	 * 允许的请求方法，可以传 `@koa/router` 的 `allowedMethods` 参数
	 *
	 * Allowed request methods
	 */
	allowedMethods?: boolean | AllowedMethodsOptions;
	/**
	 * 路由前缀
	 *
	 * Route prefix
	 */
	prefix?: string;
	/**
	 * 控制器文件名匹配规则
	 *
	 * Controller file name match rules
	 */
	matchFileName?: MatchDirectory;
	/**
	 * 是否不再要求控制器文件名以 `Controller` 结尾
	 *
	 * Allow controller files without the `Controller` suffix
	 *
	 * @default false
	 */
	acceptAnyControllerName?: boolean;
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

export interface InjectMethodMetadata {
	inject: Function & { new (...args: any[]): any };
	propertyKey: string | symbol;
}

export interface ResponseHeaderMetadata {
	header: string;
	value: string;
}

export interface CorsMetadata {
	origin?: string | string[];
	headers?: string | string[];
	methods?: Methods | Methods[];
	credentials?: boolean;
	secureContext?: boolean;
	/** second */
	maxAge?: number | string;
	/** 是否允许私有网络访问, 默认 false */
	privateNetworkAccess?: boolean;
}

export interface CorsReflectMetadata {
	origin: string;
	headers: string;
	methods: string;
	credentials: boolean;
	secureContext: boolean;
	maxAge: string;
	privateNetworkAccess: boolean;
}

export type RouteMethods = Lowercase<keyof typeof Methods>;

export type ExposeMethods = Capitalize<RouteMethods>;

export type Decorator = ClassDecorator | PropertyDecorator | MethodDecorator | ParameterDecorator;

export type MatchDirectory = RegExp | string | Array<string | RegExp> | ((val: string, suffix?: string) => boolean);
