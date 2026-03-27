import { HttpMethod } from '@/decorators/action';
import { Controller, Singleton } from '@/decorators/controller';
import { InjectService, InjectService2, InjectService3 } from '../service/InjectService';
import { Inject } from '@/decorators/inject';

@Singleton()
@Controller('/inject')
export class InjectController {
	@Inject()
	service!: InjectService;

	@Inject(InjectService2)
	service2!: InjectService2;

	@Inject(InjectService3)
	service3: any;

	@HttpMethod.Get('/service')
	show() {
		return this.service.show();
	}

	@HttpMethod.Get('/service2')
	show2() {
		return this.service2.show();
	}

	@HttpMethod.Get('/service3')
	show3() {
		return this.service3.show();
	}
}
