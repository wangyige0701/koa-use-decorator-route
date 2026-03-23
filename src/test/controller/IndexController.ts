import type Koa from 'koa';
import { HttpMethod } from '@/decorators/action';
import { Controller, ControllerBasePathOverride } from '@/decorators/controller';
import { Context, Inject } from '@/decorators/inject';
import { ResponseHeader } from '@/decorators/response';
import { Types } from '@/enum';

@Controller('/index')
export class IndexController {
	@HttpMethod.Get('/get')
	async get() {
		return 'get';
	}

	@HttpMethod.Post('/post')
	post() {
		return 'post';
	}

	@HttpMethod.Put('/put')
	put() {
		return 'put';
	}

	@HttpMethod.Delete('/delete')
	delete() {
		return 'delete';
	}

	@HttpMethod.Get('/int/:id')
	int(@Inject('id', Types.Int) id: number) {
		return id;
	}

	@HttpMethod.Get('/boolean/:value')
	Boolean(@Inject('value', Types.Boolean) value: boolean) {
		return value === true;
	}

	@HttpMethod.Get('/headers')
	@ResponseHeader('X-Header', 'Value')
	headers() {
		return 'headers';
	}

	@HttpMethod.Get('/query/:key')
	query(@Context() ctx: Koa.Context, @Inject('key', Types.String) key: string) {
		return ctx.query[key];
	}

	@ControllerBasePathOverride()
	@HttpMethod.Get('/override')
	override() {
		return 'override';
	}
}
