import { HttpMethod } from '@/decorators/action';
import { Controller } from '@/decorators/controller';

@Controller('/end')
export class EndController {
	@HttpMethod.Get('/')
	async get() {
		return 'end';
	}
}
