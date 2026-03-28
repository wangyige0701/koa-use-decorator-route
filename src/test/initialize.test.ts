import Koa from 'koa';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decorator, Decorator } from '@/index';
import Router from '@koa/router';

describe('initialize', () => {
	const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller');

	it('use constructor', async () => {
		const app = new Koa();
		const decorator = new Decorator(dir);

		app.use(decorator.middleware()).use(decorator.allowedMethods());

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);
	});

	it('use constructor with custom router', async () => {
		const app = new Koa();
		const router = new Router();
		const decorator = new Decorator(dir, router);

		app.use(decorator.middleware()).use(router.allowedMethods());

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);
	});

	it('use function', async () => {
		const app = new Koa();
		app.use(decorator(dir));

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);
	});

	it('use function with custom router', async () => {
		const app = new Koa();
		const router = new Router();
		app.use(decorator(dir, router)).use(router.allowedMethods());

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);
	});

	it('use prefix parameter', async () => {
		const app = new Koa();
		app.use(
			decorator({
				controllerDir: dir,
				prefix: '/api',
			}),
		);

		const res = await request(app.callback()).get('/api/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);
	});

	it('use prefix parameter with constructor', async () => {
		const app = new Koa();
		const decorator = new Decorator(dir);
		decorator.prefix('/api');

		app.use(decorator.middleware()).use(decorator.allowedMethods());

		const res = await request(app.callback()).get('/api/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);
	});
});
