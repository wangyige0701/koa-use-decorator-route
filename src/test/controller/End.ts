import { HttpMethod, Controller } from '@/index';

@Controller('/end')
export class EndController {
	@HttpMethod.Get('/')
	async get() {
		return 'end';
	}
}
