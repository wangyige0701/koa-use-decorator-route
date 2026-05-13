import { Controller } from '@/index';
import { HttpMethod } from '@/index';
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
}
