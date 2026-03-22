import type { ResponseHeaderMetadata } from '@/@types';
import { RESPONSE_GLOBAL_HEADER, RESPONSE_HEADER } from '@/config';
import { HttpMethods } from '@/enum';

/**
 * 响应头装饰器
 * @param header 响应头名称
 * @param value 响应头值
 */
export function ResponseHeader(header: string, value: string) {
	function result(target: any): any;
	function result(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
	function result(target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
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
 * @param origin 允许的来源
 * @param headers 允许的请求头
 * @param methods 允许的请求方法
 */
export function Cross(
	origin: string | string[] = '*',
	headers: string | string[] = ['Content-Type', 'Authorization'],
	methods: HttpMethods | HttpMethods[] = [
		HttpMethods.GET,
		HttpMethods.POST,
		HttpMethods.PUT,
		HttpMethods.DELETE,
		HttpMethods.OPTIONS,
	],
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

	const originHeader = ResponseHeader('Access-Control-Allow-Origin', origin.join(','));
	const headerHeader = ResponseHeader('Access-Control-Allow-Headers', headers.join(','));
	const methodHeader = ResponseHeader('Access-Control-Allow-Methods', methods.join(','));

	function result(target: any): any;
	function result(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
	function result(target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
		if (propertyKey) {
			originHeader(target, propertyKey, descriptor!);
			headerHeader(target, propertyKey, descriptor!);
			methodHeader(target, propertyKey, descriptor!);
			return descriptor;
		}
		originHeader(target);
		headerHeader(target);
		methodHeader(target);
		return target;
	}
	return result;
}
