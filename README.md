## 基于 koa 和 @koa/router 的装饰器路由中间件

## A Koa plugin for @koa/router that allows you to use decorators to define routes

> 依赖 `koa` `@koa/router` `reflect-metadata`

> depend on `koa` `@koa/router` `reflect-metadata`

### 安装 / Install

```bash
npm install koa-use-decorator-route
```

### 使用 / Use

#### ESM Module

```ts
import { Koa } from 'koa';
import { decorator } from 'koa-use-decorator-route';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = new Koa();
app.use(
	decorator({
		controllerDir: resolve(dirname(fileURLToPath(import.meta.url)), './controller'),
		allowedMethods: true,
	}),
);
```

#### CommonJS Module

```ts
const Koa = require('koa');
const decorator = require('koa-use-decorator-route');
const { dirname, resolve } = require('node:path');
const { fileURLToPath } = require('node:url');

const app = new Koa();
app.use(
	decorator({
		controllerDir: resolve(__dirname, './controller'),
		allowedMethods: true,
	}),
);
```

### 基本声明示例 / Basic Declaration Example

#### 成员函数返回的数据会作为响应体返回

#### Return the return value of the member function as the response body

#### 成员函数可以使用 `@Context` 注入 `Koa.Context` 类型的参数

#### The member function can use `@Context` to inject `Koa.Context` type parameter

```ts
import type Koa from 'koa';
import { Singleton, Controller, HttpMethod, Context } from 'koa-use-decorator-route';

@Singleton()
@Controller('/home')
export class HomeController {
	@HttpMethod.Get('/')
	async index(@Context() ctx: Koa.Context) {
		return 'Hello World!';
	}
}
```

### 参数注入示例 / Parameter Injection Example

#### `Inject` 装饰器第二个参数可以是一个枚举值，也可以是一个函数

#### `Inject` decorator second parameter can be an enum value or a function

```ts
import type Koa from 'koa';
import { Controller, HttpMethod, Inject, Types } from 'koa-use-decorator-route';

@Controller('/home')
export class HomeController {
	@HttpMethod.Get('/:name')
	async string(@Inject('name') name: string) {
		return `Hello ${name}`;
	}

	@HttpMethod.Get('/:id')
	async int(@Inject('id', Types.Int) id: number) {
		return `Hello ${id}`;
	}

	@HttpMethod.Get('/:path')
	async custom(@Inject('path', decodeURIComponent) path: string) {
		return `Hello ${path}`;
	}
}
```

### 响应头示例 / Response Header Example

#### 提供一个 `Cross` 装饰器，用于处理跨域请求，可作用于控制器或成员函数上

#### Provide a `Cross` decorator to handle cross-origin requests, which can be used on the controller or member function

```ts
import type Koa from 'koa';
import { Controller, HttpMethod, ResponseHeader, Methods } from 'koa-use-decorator-route';

@Controller('/home')
@Cross()
export class HomeController {
	@HttpMethod.Get('/')
	@ResponseHeader('Content-Type', 'text/plain')
	async index() {
		return 'Hello World!';
	}

	@HttpMethod.Get('/cross')
	@Cross('http://localhost:3000', ['Content-Type', 'Authorization'], [Methods.GET])
	async cross() {
		return 'Hello Cross!';
	}
}
```
