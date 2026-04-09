import { Controller } from '@/decorators/controller';
import { createMiddlewareDecorator, RouteMiddleware } from '@/decorators/middleware';
import { HttpMethod } from '@/decorators/action';

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
