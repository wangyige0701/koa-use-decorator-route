import { Controller } from '@/decorators/controller';
import { NamedRoute } from '@/decorators/namedRoute';
import { HttpMethod } from '@/decorators/action';
import { Inject } from '@/decorators/inject';
import { Types } from '@/enum';

@Controller('/named')
export class NamedRouteController {
	@NamedRoute('named.detail')
	@HttpMethod.Get('/detail/:id')
	detail(@Inject('id', Types.Int) id: number) {
		return id;
	}
}
