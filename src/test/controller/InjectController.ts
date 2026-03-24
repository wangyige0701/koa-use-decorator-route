import { HttpMethod } from '@/decorators/action';
import { Controller, Singleton } from '@/decorators/controller';
import { InjectService, InjectService2 } from '../service/InjectService';
import { Inject } from '@/decorators/inject';

@Singleton()
@Controller('/inject')
export class InjectController {
	@Inject()
	service!: InjectService;

	@Inject(InjectService2)
	service2!: InjectService2;

	@HttpMethod.Get('/service')
	show() {
		return this.service.show();
	}

	@HttpMethod.Get('/service2')
	show2() {
		return this.service2.show();
	}
}
