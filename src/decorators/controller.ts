import { CONTROLLER, SINGLETON } from '@/config';

/**
 * 控制器装饰器
 *
 * Controller decorator
 *
 * @param basePath 控制器基础路径
 */
export function Controller(basePath: string) {
	return (target: any) => {
		Reflect.defineMetadata(CONTROLLER, basePath, target);
		return target;
	};
}

/**
 * 单例模式装饰器
 *
 * Singleton pattern decorator
 */
export function Singleton(...params: any[]) {
	return (target: any) => {
		if (!Reflect.hasMetadata(SINGLETON, target)) {
			Reflect.defineMetadata(SINGLETON, new target(...params), target);
		}
		return target;
	};
}
