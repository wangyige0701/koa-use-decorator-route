import { describe, expect, it } from 'vitest';
import Koa from 'koa';
import request from 'supertest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decorator } from '@/index';

describe('Inject', () => {
	function getApp() {
		const app = new Koa();
		app.use(
			decorator({
				controllerDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller'),
				allowedMethods: true,
			}),
		);
		return app;
	}

	it('should return inject service', async () => {
		const app = getApp();
		const res = await request(app.callback()).get('/inject/service');
		expect(res.text).toBe('inject service');
		expect(res.status).toBe(200);
	});

	it('should return inject service 2', async () => {
		const app = getApp();
		const res = await request(app.callback()).get('/inject/service2');
		expect(res.text).toBe('inject service 2');
		expect(res.status).toBe(200);
	});

	it('should return inject service 3', async () => {
		const app = getApp();
		const res = await request(app.callback()).get('/inject/service3');
		expect(res.text).toBe('inject service 3');
		expect(res.status).toBe(200);
	});
});
