import { CONTROLLER, SINGLETON } from '@/config';

/**
 * 控制器装饰器
 * @param basePath 控制器基础路径
 * @param isSingleton 是否为单例模式
 */
export function Controller(basePath: string, isSingleton: boolean = true) {
	return (target: any) => {
		Reflect.defineMetadata(CONTROLLER, basePath, target);
		if (isSingleton && !Reflect.hasMetadata(SINGLETON, target)) {
			Reflect.defineMetadata(SINGLETON, new target(), target);
		}
		return target;
	};
}
