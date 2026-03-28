import { Controller } from '@/decorators/controller';
import { SingletonService, SingletonService2 } from '../service/SingletonService';
import { HttpMethod } from '@/decorators/action';
import { Inject } from '@/decorators/inject';

@Controller('/singleton')
export class SingletonController {
	@Inject()
	service!: SingletonService;

	@Inject()
	service2!: SingletonService2;

	@HttpMethod.Get('/count')
	getCount() {
		return this.service.getCount();
	}

	@HttpMethod.Get('/count2')
	getCount2() {
		return this.service2.getCount();
	}
}
