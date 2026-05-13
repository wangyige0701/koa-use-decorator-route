import type { CorsMetadata, CorsReflectMetadata, ResponseHeaderMetadata } from '@/@types';
import { RESPONSE_GLOBAL_HEADER, RESPONSE_HEADER, ROUTE_CORS, ROUTE_METHOD } from '@/config';
import { Methods } from '@/enum';
import {
	ACCESS_CONTROL_ALLOW_CREDENTIALS,
	ACCESS_CONTROL_ALLOW_HEADERS,
	ACCESS_CONTROL_ALLOW_METHODS,
	ACCESS_CONTROL_ALLOW_ORIGIN,
	CROSS_ORIGIN_EMBEDDER_POLICY,
	CROSS_ORIGIN_OPENER_POLICY,
} from '@/headers';

/**
 * 响应头装饰器
 *
 * Response header decorator
 *
 * @param header 响应头名称 / Response header name
 * @param value 响应头值 / Response header value
 */
export function ResponseHeader(header: string, value: string) {
	function result(target: any): any;
	function result(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
	function result(target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
		const data = {
			header,
			value,
		} as ResponseHeaderMetadata;

		if (propertyKey) {
			const responseHeader = (Reflect.getMetadata(RESPONSE_HEADER, target.constructor, propertyKey) ||
				[]) as ResponseHeaderMetadata[];
			responseHeader.push(data);
			Reflect.defineMetadata(RESPONSE_HEADER, responseHeader, target.constructor, propertyKey);
			return descriptor;
		}
		const responseHeader = (Reflect.getMetadata(RESPONSE_GLOBAL_HEADER, target) || []) as ResponseHeaderMetadata[];
		responseHeader.push(data);
		Reflect.defineMetadata(RESPONSE_GLOBAL_HEADER, responseHeader, target);

		return target;
	}
	return result;
}

const defaultOrigin = '*';
const defaultHeaders = '';
const defaultMethods = [Methods.GET, Methods.POST, Methods.PUT, Methods.DELETE, Methods.PATCH, Methods.HEAD];

interface CorsReturnType {
	(target: any): any;
	(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
}

/**
 * 跨域装饰器
 *
 * Cross origin decorator
 *
 * @param origin 允许的来源 / Allowed origin
 * @param headers 允许的请求头 / Allowed request headers
 * @param methods 允许的请求方法 / Allowed request methods
 * @param credentials 是否允许使用凭证 / Whether to allow credentials
 * @param secureContext 是否需要安全上下文 / Whether secure context is required
 * @param maxAge 最大缓存时间，单位秒 / Maximum cache age in seconds
 * @param privateNetworkAccess 是否允许私有网络访问 / Whether to allow private network access
 */
export function Cors(metadata: CorsMetadata): CorsReturnType;
/**
 * 跨域装饰器
 *
 * Cross origin decorator
 *
 * @param origin 允许的来源 / Allowed origin - default '*'
 * @param headers 允许的请求头 / Allowed request headers - default ''
 * @param methods 允许的请求方法 / Allowed request methods - default ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
 */
export function Cors(
	origin?: string | string[],
	headers?: string | string[],
	methods?: Methods | Methods[],
): CorsReturnType;
export function Cors(
	origin: CorsMetadata | string | string[] = defaultOrigin,
	headers: string | string[] = defaultHeaders,
	methods: Methods | Methods[] = defaultMethods,
): CorsReturnType {
	let credentials = false;
	let secureContext = false;
	let maxAge = '';
	let privateNetworkAccess = false;
	if (Object.prototype.toString.call(origin) === '[object Object]') {
		const _copy = origin as CorsMetadata;
		origin = _copy.origin ?? defaultOrigin;
		headers = _copy.headers ?? defaultHeaders;
		methods = _copy.methods ?? defaultMethods;
		credentials = _copy.credentials ?? false;
		secureContext = _copy.secureContext ?? false;
		maxAge = String(_copy.maxAge ?? '');
		privateNetworkAccess = _copy.privateNetworkAccess ?? false;
	}
	if (typeof origin === 'string') {
		origin = [origin];
	}
	if (typeof headers === 'string') {
		headers = [headers];
	}
	if (typeof methods === 'string') {
		methods = [methods];
	}
	if (typeof credentials !== 'boolean') {
		credentials = false;
	}

	const originHeaderValue = Array.isArray(origin) ? origin.join(',') : '*';
	const originHeader = originHeaderValue ? ResponseHeader(ACCESS_CONTROL_ALLOW_ORIGIN, originHeaderValue) : void 0;

	const methodsHeaderValue = Array.isArray(methods) ? methods.join(',') : defaultMethods.join(',');
	const methodHeader = methodsHeaderValue ? ResponseHeader(ACCESS_CONTROL_ALLOW_METHODS, methodsHeaderValue) : void 0;

	const headersHeaderValue = Array.isArray(headers) ? headers.join(',') : '';
	const headerHeader = headersHeaderValue ? ResponseHeader(ACCESS_CONTROL_ALLOW_HEADERS, headersHeaderValue) : void 0;

	const credentialsHeader = credentials ? ResponseHeader(ACCESS_CONTROL_ALLOW_CREDENTIALS, 'true') : void 0;
	const openerPolicyHeader = secureContext ? ResponseHeader(CROSS_ORIGIN_OPENER_POLICY, 'same-origin') : void 0;
	const embedderPolicyHeader = secureContext ? ResponseHeader(CROSS_ORIGIN_EMBEDDER_POLICY, 'require-corp') : void 0;

	function result(target: any): any;
	function result(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
	function result(target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
		if (propertyKey) {
			originHeader && originHeader(target, propertyKey, descriptor!);
			headerHeader && headerHeader(target, propertyKey, descriptor!);
			credentialsHeader && credentialsHeader(target, propertyKey, descriptor!);
			openerPolicyHeader && openerPolicyHeader(target, propertyKey, descriptor!);
			embedderPolicyHeader && embedderPolicyHeader(target, propertyKey, descriptor!);
			// 接口入口位置定义的跨域配置需要根据路由方法来设置
			const method = Reflect.getMetadata(ROUTE_METHOD, target.constructor, propertyKey);
			if (method) {
				ResponseHeader(ACCESS_CONTROL_ALLOW_METHODS, method)(target, propertyKey, descriptor!);
			}
			// 记录路由的跨域配置
			Reflect.defineMetadata(
				ROUTE_CORS,
				{
					origin: originHeaderValue,
					headers: headersHeaderValue,
					methods: method || '',
					credentials,
					secureContext,
					maxAge,
					privateNetworkAccess,
				} satisfies CorsReflectMetadata,
				target.constructor,
				propertyKey,
			);
			return descriptor;
		}

		originHeader && originHeader(target);
		headerHeader && headerHeader(target);
		methodHeader && methodHeader(target);
		credentialsHeader && credentialsHeader(target);
		openerPolicyHeader && openerPolicyHeader(target);
		embedderPolicyHeader && embedderPolicyHeader(target);
		// 记录根路由的跨域配置
		Reflect.defineMetadata(
			ROUTE_CORS,
			{
				origin: originHeaderValue,
				headers: headersHeaderValue,
				methods: methodsHeaderValue,
				credentials,
				secureContext,
				maxAge,
				privateNetworkAccess,
			} satisfies CorsReflectMetadata,
			target,
		);
		return target;
	}
	return result;
}

/**
 * 跨域装饰器
 *
 * Cross origin decorator
 *
 * @param origin 允许的来源 / Allowed origin
 * @param headers 允许的请求头 / Allowed request headers
 * @param methods 允许的请求方法 / Allowed request methods
 *
 * @deprecated 请使用 `Cors` 装饰器代替 / Please use `Cors` decorator instead
 */
export const Cross = Cors;
