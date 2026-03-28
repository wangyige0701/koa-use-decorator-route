import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Koa from 'koa';
import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import Decorator, { decorator } from '@/index';

describe('Match', () => {
	const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller');

	it('use string match IndexController', async () => {
		vi.resetModules();
		const app = new Koa();
		app.use(decorator({ controllerDir: dir, matchFileName: 'IndexController', allowedMethods: true }));

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);

		const res2 = await request(app.callback()).get('/inject/service');
		expect(res2.status).toBe(404);
	});

	it('use regexp match IndexController', async () => {
		vi.resetModules();
		const app = new Koa();
		app.use(decorator({ controllerDir: dir, matchFileName: /^IndexController$/, allowedMethods: true }));

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);

		const res2 = await request(app.callback()).get('/inject/service');
		expect(res2.status).toBe(404);
	});

	it('use function match IndexController', async () => {
		vi.resetModules();
		const app = new Koa();
		app.use(
			decorator({
				controllerDir: dir,
				matchFileName: (fileName) => fileName === 'IndexController',
				allowedMethods: true,
			}),
		);

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);

		const res2 = await request(app.callback()).get('/inject/service');
		expect(res2.status).toBe(404);
	});

	it('use constructor match IndexController', async () => {
		vi.resetModules();
		const app = new Koa();
		const decoratorIns = new Decorator(dir);
		decoratorIns.matchFileName('IndexController').allowedMethods();
		app.use(decoratorIns.middleware());

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);

		const res2 = await request(app.callback()).get('/inject/service');
		expect(res2.status).toBe(404);
	});

	it('use constructor with array match IndexController', async () => {
		vi.resetModules();
		const app = new Koa();
		const decoratorIns = new Decorator(dir);
		decoratorIns.matchFileName(['IndexController', 'InjectController']).allowedMethods();
		app.use(decoratorIns.middleware());

		const res = await request(app.callback()).get('/index/get');
		expect(res.text).toBe('get');
		expect(res.status).toBe(200);

		const res2 = await request(app.callback()).get('/inject/service');
		expect(res2.text).toBe('inject service');
		expect(res2.status).toBe(200);

		const res3 = await request(app.callback()).get('/singleton/count');
		expect(res3.status).toBe(404);
	});
});
