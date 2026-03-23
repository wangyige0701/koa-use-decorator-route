import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import Koa from 'koa';
import path from 'path';
import { fileURLToPath } from 'url';
import { decorator } from '@/index';

describe('IF', () => {
	function createApp() {
		vi.resetModules();
		const app = new Koa();
		app.use(
			decorator({
				controllerDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller'),
				allowedMethods: true,
			}),
		);
		return app;
	}

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('should return test', async () => {
		vi.stubEnv('__IF__STATE__', 'true');

		const app = createApp();
		const res = await request(app.callback()).get('/if/test');
		expect(res.text).toBe('test');
		expect(res.status).toBe(200);
		expect(res.headers['x-test']).toBe('123');
	});

	it('should be 404', async () => {
		vi.stubEnv('__IF__STATE__', 'false');

		const app = createApp();
		const res = await request(app.callback()).get('/if/test');
		expect(res.status).toBe(404);
	});

	it('should return test with else', async () => {
		vi.stubEnv('__IF__STATE__', 'false');

		const app = createApp();
		const res = await request(app.callback()).get('/else/test');
		expect(res.status).toBe(200);
		expect(res.text).toBe('test');
	});
});
