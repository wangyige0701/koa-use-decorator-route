import { Controller } from '@/decorators/controller';
import { HttpMethod } from '@/decorators/action';
import { Cors, Cross } from '@/decorators/response';
import { Methods } from '@/enum';

@Controller('/cors')
export class CorsController {
	@Cors()
	@HttpMethod.Get('/')
	index() {
		return 'ok';
	}

	// method level, using Cross alias
	@Cross()
	@HttpMethod.Get('/cross')
	cross() {
		return 'ok2';
	}

	// custom cors params on method
	@Cors('https://example.com', ['X-Test-Header', 'Authorization'], [Methods.GET, Methods.POST])
	@HttpMethod.Get('/custom')
	custom() {
		return 'custom';
	}

	// object form of Cors metadata
	@Cors({ origin: 'https://obj.example.com', headers: ['X-Obj-Header'], methods: [Methods.GET] })
	@HttpMethod.Get('/obj')
	obj() {
		return 'obj';
	}
}
