export function isArray(val: any): val is any[] {
	return Array.isArray(val);
}

export function isBoolean(val: any): val is boolean {
	return typeof val === 'boolean';
}

export function isString(val: any): val is string {
	return typeof val === 'string';
}

export function isFunction(val: any): val is (...args: any[]) => any {
	return typeof val === 'function';
}

export function isRegExp(val: any): val is RegExp {
	return val instanceof RegExp;
}
