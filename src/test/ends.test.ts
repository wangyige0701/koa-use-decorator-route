import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import Koa from 'koa';
import request from 'supertest';
import { Decorator } from '@/index';

describe('EndController', () => {
	const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './controller');

	it('get /end', async () => {
		const app = new Koa();
		const decorator = new Decorator(dir);

		app.use(decorator.acceptAnyControllerName().middleware()).use(decorator.allowedMethods());

		const res = await request(app.callback()).get('/end');
		expect(res.text).toBe('end');
	});
});
