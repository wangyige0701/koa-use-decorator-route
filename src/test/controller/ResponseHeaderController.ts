import { Controller } from '@/index';
import { HttpMethod, RouteMiddleware } from '@/index';
import { ResponseHeader } from '@/index';

@ResponseHeader('X-Global', 'global')
@Controller('/resp')
export class ResponseHeaderController {
	@HttpMethod.Get('/method')
	@ResponseHeader('X-Method', 'method')
	method() {
		return 'ok';
	}

	@HttpMethod.Get('/override')
	@ResponseHeader('X-Global', 'overridden')
	override() {
		return 'overridden';
	}

	@HttpMethod.Get('/noglobal')
	noglobal() {
		return 'noglobal';
	}

	// top header should be set before route middlewares; test with a middleware that throws
	@RouteMiddleware((ctx) => {
		ctx.throw(418, 'teapot');
	})
	@HttpMethod.Get('/throw')
	@ResponseHeader('X-Top', 'top', true)
	throw() {
		return 'ignored';
	}
}
