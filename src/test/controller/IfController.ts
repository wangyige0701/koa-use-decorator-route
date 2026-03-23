import { HttpMethod } from '@/decorators/action';
import { Controller, Singleton } from '@/decorators/controller';
import { IF } from '@/decorators/if';
import { ResponseHeader } from '@/decorators/response';

@Singleton()
@(IF(!!process.env.__IF__STATE__, Controller('/if')).ELSE(Controller('/else')).ENDIF())
export class IfController {
	@HttpMethod.Get('/test')
	@(IF(!!process.env.__IF__STATE__, ResponseHeader('X-Test', '123')).ENDIF())
	async test() {
		return 'test';
	}
}
