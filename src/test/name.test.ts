import { describe, expect, it } from 'vitest';
import request from 'supertest';
import Koa from 'koa';
import path from 'path';
import { fileURLToPath } from 'url';
import { Decorator } from '@/index';

describe('NamedRoute', () => {
	const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller');

	it('should register named route and generate url', async () => {
		const app = new Koa();
		const decorator = new Decorator(dir);
		decorator.matchFileName('NameController');
		app.use(decorator.middleware()).use(decorator.allowedMethods());

		// 触发一次请求以确保路由已初始化
		const res = await request(app.callback()).get('/named/detail/123');
		expect(res.text).toBe('123');

		// 初始化后可以通过路由名生成 url
		const url = decorator.getRouter().url('named.detail', { id: '123' });
		expect(url).toBe('/named/detail/123');
	});
});
