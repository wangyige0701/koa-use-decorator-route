import { describe, expect, it } from 'vitest';
import request from 'supertest';
import Koa from 'koa';
import path from 'path';
import { fileURLToPath } from 'url';
import { Decorator } from '@/index';

describe('RouteMiddleware', () => {
	const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller');

	it('should apply class and method middlewares', async () => {
		const app = new Koa();
		const decorator = new Decorator(dir);
		decorator.matchFileName('MiddlewareController');
		app.use(decorator.middleware()).use(decorator.allowedMethods());

		const res1 = await request(app.callback()).get('/mw/class');
		expect(res1.text).toBe('ok');
		expect(res1.headers['x-class']).toBe('1');

		const res2 = await request(app.callback()).get('/mw/method');
		expect(res2.text).toBe('ok2');
		expect(res2.headers['x-class']).toBe('1');
		expect(res2.headers['x-method']).toBe('2');

		const res3 = await request(app.callback()).get('/mw/test');
		expect(res3.text).toBe('ok3');
		expect(res3.headers['x-class']).toBe('1');
		expect(res3.headers['x-test']).toBe('test');
	});
});
