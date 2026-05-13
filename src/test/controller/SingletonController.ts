import { Controller } from '@/index';
import { HttpMethod } from '@/index';
import { Inject } from '@/index';
import { SingletonService, SingletonService2 } from '../service/SingletonService';

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
