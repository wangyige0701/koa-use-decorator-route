import { Singleton } from '@/decorators/controller';

@Singleton()
export class SingletonService {
	private static count = 0;

	constructor() {
		SingletonService.count++;
	}

	getCount() {
		return SingletonService.count;
	}
}

export class SingletonService2 {
	private static count = 0;

	constructor() {
		SingletonService2.count++;
	}

	getCount() {
		return SingletonService2.count;
	}
}
