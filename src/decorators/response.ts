import type { ResponseHeaderMetadata } from '@/@types';
import { RESPONSE_GLOBAL_HEADER, RESPONSE_HEADER } from '@/config';
import { Methods } from '@/enum';

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

/**
 * 跨域装饰器
 *
 * Cross origin decorator
 *
 * @param origin 允许的来源 / Allowed origin
 * @param headers 允许的请求头 / Allowed request headers
 * @param methods 允许的请求方法 / Allowed request methods
 */
export function Cross(
	origin: string | string[] = '*',
	headers: string | string[] = ['Content-Type', 'Authorization'],
	methods: Methods | Methods[] = [Methods.GET, Methods.POST, Methods.PUT, Methods.DELETE, Methods.OPTIONS],
) {
	if (typeof origin === 'string') {
		origin = [origin];
	}
	if (typeof headers === 'string') {
		headers = [headers];
	}
	if (typeof methods === 'string') {
		methods = [methods];
	}

	const originHeader = Array.isArray(origin)
		? ResponseHeader('Access-Control-Allow-Origin', origin.join(','))
		: void 0;
	const headerHeader = Array.isArray(headers)
		? ResponseHeader('Access-Control-Allow-Headers', headers.join(','))
		: void 0;
	const methodHeader = Array.isArray(methods)
		? ResponseHeader('Access-Control-Allow-Methods', methods.join(','))
		: void 0;

	function result(target: any): any;
	function result(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
	function result(target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
		if (propertyKey) {
			originHeader && originHeader(target, propertyKey, descriptor!);
			headerHeader && headerHeader(target, propertyKey, descriptor!);
			methodHeader && methodHeader(target, propertyKey, descriptor!);
			return descriptor;
		}
		originHeader && originHeader(target);
		headerHeader && headerHeader(target);
		methodHeader && methodHeader(target);
		return target;
	}
	return result;
}
