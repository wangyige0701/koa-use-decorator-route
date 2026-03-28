import Koa from 'koa';
import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { decorator } from '@/index';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Singleton', () => {
	const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller');

	it('should return 1', async () => {
		vi.resetModules();
		const app = new Koa();
		app.use(decorator({ controllerDir: dir, matchFileName: 'SingletonController' }));

		const res = await request(app.callback()).get('/singleton/count');
		expect(res.text).toBe('1');
		expect(res.status).toBe(200);

		const res2 = await request(app.callback()).get('/singleton/count');
		expect(res2.text).toBe('1');
		expect(res2.status).toBe(200);
	});

	it('should return 2', async () => {
		vi.resetModules();
		const app = new Koa();
		app.use(decorator({ controllerDir: dir, matchFileName: 'SingletonController' }));

		const res = await request(app.callback()).get('/singleton/count2');
		expect(res.text).toBe('1');
		expect(res.status).toBe(200);

		const res2 = await request(app.callback()).get('/singleton/count2');
		expect(res2.text).toBe('2');
		expect(res2.status).toBe(200);
	});
});
