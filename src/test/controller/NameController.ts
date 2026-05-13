import { Controller } from '@/index';
import { NamedRoute } from '@/index';
import { HttpMethod } from '@/index';
import { Inject } from '@/index';
import { Types } from '@/index';

@Controller('/named')
export class NamedRouteController {
	@NamedRoute('named.detail')
	@HttpMethod.Get('/detail/:id')
	detail(@Inject('id', Types.Int) id: number) {
		return id;
	}
}
