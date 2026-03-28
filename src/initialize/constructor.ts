import type { Middleware, DefaultState, DefaultContext } from 'koa';
import Router from '@koa/router';
import { ControllerDirRequired } from '@/error';
import { decorator } from './function';

export class Decorator {
	private controllerDir: string;
	private router!: Router;

	constructor(controllerDir: string, router?: Router) {
		if (!controllerDir) {
			throw new Error(ControllerDirRequired);
		}
		this.controllerDir = controllerDir;

		if (router && router instanceof Router) {
			this.router = router;
		}

		if (!this.router) {
			this.router = new Router();
		}

		return new Proxy(this, {
			get: (target, prop, receiver) => {
				if (!Reflect.has(target, prop) && Reflect.has(this.router, prop)) {
					return Reflect.get(this.router, prop, receiver);
				}
				return Reflect.get(target, prop, receiver);
			},
		});
	}

	getRouter() {
		return this.router;
	}

	middleware(): Middleware {
		return decorator(this.controllerDir, this.router);
	}
}

export interface Decorator extends Router<DefaultState, DefaultContext> {}
