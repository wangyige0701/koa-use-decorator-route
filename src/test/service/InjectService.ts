import { Singleton } from '@/decorators/controller';

@Singleton()
export class InjectService {
	show() {
		return 'inject service';
	}
}

export class InjectService2 {
	show() {
		return 'inject service 2';
	}
}

export class InjectService3 {
	show() {
		return 'inject service 3';
	}
}
