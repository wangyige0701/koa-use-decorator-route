import { describe, expect, it } from 'vitest';
import request from 'supertest';
import Koa from 'koa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decorator } from '@/index';

describe('Cors / Cross decorators', () => {
	const app = new Koa();
	app.use(
		decorator({
			controllerDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller'),
			allowedMethods: true,
			matchFileName: 'CorsController',
		}),
	);

	it('should set default CORS headers from method-level @Cors and method-level @Cross', async () => {
		const res = await request(app.callback()).get('/cors/');
		expect(res.status).toBe(200);
		expect(res.text).toBe('ok');
		expect(res.headers['access-control-allow-origin']).toBe('*');
		expect(res.headers['access-control-allow-headers']).toBe('Content-Type,Authorization');
		expect(res.headers['access-control-allow-methods']).toBe('GET,POST,PUT,DELETE,OPTIONS');
	});

	it('should set default CORS headers from method-level @Cross', async () => {
		const res = await request(app.callback()).get('/cors/cross');
		expect(res.status).toBe(200);
		expect(res.text).toBe('ok2');
		expect(res.headers['access-control-allow-origin']).toBe('*');
		expect(res.headers['access-control-allow-headers']).toBe('Content-Type,Authorization');
		expect(res.headers['access-control-allow-methods']).toBe('GET,POST,PUT,DELETE,OPTIONS');
	});

	it('should set custom CORS headers when Cors called with parameters', async () => {
		const res = await request(app.callback()).get('/cors/custom');
		expect(res.status).toBe(200);
		expect(res.text).toBe('custom');
		expect(res.headers['access-control-allow-origin']).toBe('https://example.com');
		expect(res.headers['access-control-allow-headers']).toBe('X-Test-Header,Authorization');
		expect(res.headers['access-control-allow-methods']).toBe('GET,POST');
	});

	it('should set custom CORS headers when Cors called with object metadata', async () => {
		const res = await request(app.callback()).get('/cors/obj');
		expect(res.status).toBe(200);
		expect(res.text).toBe('obj');
		expect(res.headers['access-control-allow-origin']).toBe('https://obj.example.com');
		expect(res.headers['access-control-allow-headers']).toBe('X-Obj-Header');
		expect(res.headers['access-control-allow-methods']).toBe('GET');
	});
});
