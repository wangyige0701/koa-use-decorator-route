import { describe, expect, it } from 'vitest';
import request from 'supertest';
import Koa from 'koa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decorator } from '@/initialize/function';

describe('ResponseHeader decorator', () => {
	const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller');

	function createApp() {
		const app = new Koa();
		app.use(
			decorator({
				controllerDir: dir,
				allowedMethods: true,
				matchFileName: /ResponseHeaderController/,
			}),
		);
		return app;
	}

	it('should merge class-level and method-level headers', async () => {
		const app = createApp();
		const res = await request(app.callback()).get('/resp/method');
		expect(res.status).toBe(200);
		expect(res.text).toBe('ok');
		expect(res.headers['x-global']).toBe('global'); // class-level
		expect(res.headers['x-method']).toBe('method'); // method-level
	});

	it('method-level header should override class-level header with same name', async () => {
		const app = createApp();
		const res = await request(app.callback()).get('/resp/override');
		expect(res.status).toBe(200);
		expect(res.text).toBe('overridden');
		expect(res.headers['x-global']).toBe('overridden'); // overridden by method
	});

	it('class-level header should be applied to methods without method-level override', async () => {
		const app = createApp();
		const res = await request(app.callback()).get('/resp/noglobal');
		expect(res.status).toBe(200);
		expect(res.text).toBe('noglobal');
		expect(res.headers['x-global']).toBe('global');
	});

	it('top response header should be set even if route middleware throws', async () => {
		const app = createApp();
		const res = await request(app.callback()).get('/resp/throw');
		// koa will convert thrown status to response
		expect(res.status).toBe(418);
		// top header must be present because it is inserted before middleware
		expect(res.headers['x-top']).toBe('top');
	});
});
