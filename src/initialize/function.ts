import type { Middleware } from 'koa';
import type { DecoratorOptions } from '@/@types';
import Router from '@koa/router';
import { initialize } from '@/initialize';
import { isBoolean, isString } from '@/utils';
import { ControllerDirRequired } from '@/error';

export function decorator(options: string | DecoratorOptions, router_?: Router): Middleware {
	const router = router_ && router_ instanceof Router ? router_ : new Router();

	if (isString(options)) {
		options = { controllerDir: options };
	}

	return async (ctx, next) => {
		const { controllerDir, allowedMethods, prefix } = options || {};
		if (!controllerDir) {
			throw new Error(ControllerDirRequired);
		}

		await initialize(router, controllerDir);

		if (isString(prefix) && prefix) {
			router.prefix(prefix);
		}

		ctx.app.use(router.routes());

		if (isBoolean(allowedMethods)) {
			if (allowedMethods) {
				ctx.app.use(router.allowedMethods());
			}
		} else if (allowedMethods) {
			ctx.app.use(router.allowedMethods(allowedMethods));
		}

		await next();
	};
}
