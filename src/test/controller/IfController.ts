import { HttpMethod } from '@/decorators/action';
import { Controller, Singleton } from '@/decorators/controller';
import { IF } from '@/decorators/if';
import { Inject } from '@/decorators/inject';
import { ResponseHeader } from '@/decorators/response';

function add(num: number) {
	return function (v: string) {
		return Number(v) + num;
	};
}

@Singleton()
@(IF(process.env.__IF__STATE__ === 'true', Controller('/if'))
	.ELSE(Controller('/else'))
	.ENDIF())
export class IfController {
	@HttpMethod.Get('/test')
	@(IF(process.env.__IF__STATE__ === 'true', ResponseHeader('X-Test', '123')).ENDIF())
	async test() {
		return 'test';
	}

	@HttpMethod.Get('/param/:value')
	param(
		@(IF(process.env.__IF__STATE__ === 'true', Inject('value', add(10)))
			.ELSE(Inject('value', add(-20)))
			.ENDIF())
		value: number,
	) {
		return value;
	}
}
