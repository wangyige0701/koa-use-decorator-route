import { Controller } from '@/index';
import { createMiddlewareDecorator, RouteMiddleware } from '@/index';
import { HttpMethod } from '@/index';

const Test = createMiddlewareDecorator((ctx, next) => {
	ctx.set('x-test', 'test');
	return next();
});

@RouteMiddleware((ctx, next) => {
	ctx.set('x-class', '1');
	return next();
})
@Controller('/mw')
export class MiddlewareController {
	@HttpMethod.Get('/class')
	classRoute() {
		return 'ok';
	}

	@RouteMiddleware((ctx, next) => {
		ctx.set('x-method', '2');
		return next();
	})
	@HttpMethod.Get('/method')
	methodRoute() {
		return 'ok2';
	}

	@Test()
	@HttpMethod.Get('/test')
	testRoute() {
		return 'ok3';
	}
}
