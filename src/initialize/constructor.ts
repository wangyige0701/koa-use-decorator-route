import type { Middleware, DefaultState, DefaultContext } from 'koa';
import type { MatchDirectory } from '@/@types';
import Router from '@koa/router';
import { ControllerDirRequired } from '@/error';
import { decorator } from '@/initialize/function';
import { isArray, isFunction } from '@/utils';

export class Decorator {
	private _router!: Router;
	private controllerDir: string;
	private matchRules?: MatchDirectory;

	constructor(controllerDir: string, router?: Router) {
		if (!controllerDir) {
			throw new Error(ControllerDirRequired);
		}
		this.controllerDir = controllerDir;

		if (router && router instanceof Router) {
			this._router = router;
		}

		if (!this._router) {
			this._router = new Router();
		}

		const proxy = new Proxy(this, {
			get: (target, prop, receiver) => {
				if (!Reflect.has(target, prop) && Reflect.has(this._router, prop)) {
					const result = Reflect.get(this._router, prop, receiver);
					if (isFunction(result)) {
						return (...params: any[]) => {
							const res = result.apply(this._router, params);
							if (res === this._router) {
								// 返回结果是 Router 实例时，替换为 Decorator 实例
								return proxy;
							}
							return res;
						};
					}
					return result;
				}
				return Reflect.get(target, prop, receiver);
			},
		});

		return proxy;
	}

	getRouter() {
		return this._router;
	}

	middleware(): Middleware {
		if (this.matchRules) {
			return decorator({ controllerDir: this.controllerDir, matchFileName: this.matchRules }, this._router);
		}
		return decorator(this.controllerDir, this._router);
	}

	matchFileName(rule: MatchDirectory) {
		if (isFunction(rule)) {
			this.matchRules = rule;
			return this;
		}
		if (!this.matchRules) {
			this.matchRules = [] as (string | RegExp)[];
		}
		if (isArray(rule)) {
			(this.matchRules as (string | RegExp)[]).push(...(rule as Array<string | RegExp>));
		} else {
			(this.matchRules as (string | RegExp)[]).push(rule);
		}
		return this;
	}
}

type ReplaceReturn<T extends Router<DefaultState, DefaultContext>> = {
	[P in keyof T]: T[P] extends (...args: any[]) => any
		? ReturnType<T[P]> extends Router
			? (...params: Parameters<T[P]>) => Decorator
			: T[P]
		: T[P];
};

export interface Decorator extends ReplaceReturn<Router<DefaultState, DefaultContext>> {}
