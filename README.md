# 基于 koa 和 @koa/router 的装饰器路由中间件

## A Koa plugin for @koa/router that allows you to use decorators to define routes.

> 依赖 `koa`、`@koa/router`、`reflect-metadata`；需要在 `tsconfig` 中启用 `experimentalDecorators` 和 `emitDecoratorMetadata`

> Requires `koa`, `@koa/router`, and `reflect-metadata`. Needs to enable `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig`.

> 此插件使用的装饰器是 TypeScript 的功能，如果使用 JavaScript，需要确保能正确编译为 TypeScript 风格的装饰器产物，包括参数装饰器。

> The decorators used by this plugin are a TypeScript feature. If you are using JavaScript, you need to ensure that it can be correctly compiled to TypeScript-style decorator output, including parameter decorators.

### 提供基于 Koa 的装饰器路由，使路由定义更简洁以及更易读。

### Provides decorator-based routing for Koa, making route definitions cleaner and more readable.

## 安装 / Install

```bash
npm install koa-use-decorator-route
```

## 使用 / Use

> 目录下的控制器文件名必须以 `Controller` 结尾

> The controller file name must end with `Controller`.

> 目录下的控制器文件必须导出一个被 `@Controller` 装饰器装饰的类

> The controller file must export a class decorated with `@Controller`.

- ### 声明 / Declaration

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

- ### 基本声明示例 / Basic Declaration Example

#### 成员函数返回的数据会作为响应体返回

#### The return value of the member function will be used as the response body.

#### 成员函数可以使用 `@Context` 注入 `Koa.Context` 类型的参数

#### The member function can use `@Context` to inject a `Koa.Context` object.

```ts
import type Koa from 'koa';
import { Controller, HttpMethod, Context } from 'koa-use-decorator-route';

@Controller('/home')
export class HomeController {
	@HttpMethod.Get('/')
	async index(@Context() ctx: Koa.Context) {
		console.log(ctx.query);
		return 'Hello World!';
	}
}
```

- ### 单例 / Singleton

#### 单例装饰器不会修改或重写类的构造函数，而是在内部维护一个单例实例。只有在插件内部需要访问该类实例时，才会返回维护的实例对象。

#### The singleton decorator does not modify or override the class constructor. Instead, it maintains a single instance internally and only returns this instance when accessed within the plugin.

#### 非控制器目录下的其它类也可以使用 `@Singleton` 装饰器

#### Classes outside the controller directory can also use the `@Singleton` decorator.

```ts
import { Singleton, Controller, HttpMethod } from 'koa-use-decorator-route';

@Singleton()
@Controller('/home')
export class HomeController {
	@HttpMethod.Get('/')
	async index() {
		return 'Hello World!';
	}
}

// HomeService.ts
import { Singleton } from 'koa-use-decorator-route';

@Singleton()
export class HomeService {
	async index() {
		return 'Hello World!';
	}
}
```

- ### 参数注入示例 / Parameter Injection Example

#### `@Inject` 装饰器第二个参数可以是一个枚举值，也可以是一个函数

#### `@Inject` decorator second parameter can be an enum value or a function.

```ts
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

- ### 响应头示例 / Response Header Example

#### `@ResponseHeader` 装饰器用于设置响应头，第一个参数是响应头名称，第二个参数是响应头值

#### The `@ResponseHeader` decorator is used to set response headers. The first parameter specifies the header name, and the second parameter specifies the header value.

#### 提供一个 `@Cross` 装饰器，用于处理跨域请求，可作用于控制器或成员函数上

#### The `@Cross` decorator handles cross-origin requests, and can be applied to controllers or individual member functions.

```ts
import { Controller, HttpMethod, ResponseHeader, Methods, Cross } from 'koa-use-decorator-route';

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

- ### 条件装饰器 / Conditional Decorator (>= 0.1.0)

#### `@IF` 装饰器可以根据条件判断应用不同的装饰器，必须要链式调用 `ENDIF` 结束

#### The `@IF` decorator allows applying different decorators based on a condition, and must be concluded by chaining a call to `ENDIF`.

```ts
import { Controller, HttpMethod, IF } from 'koa-use-decorator-route';

@(IF(process.env.SOME_ENV, @Controller('/if-not'))
	.ELIF(process.env.SOME_ENV, @Controller('/elif'))
	.ELSE(@Controller('/else'))
	.ENDIF())
export class HomeController {
	@HttpMethod.Get('/')
	async index() {
		return 'Hello World!';
	}
}
```

- ### 成员属性注入 / Member Property Injection (>= 0.1.0)

#### 可以通过传递构造函数给 `@Inject` 装饰器来注入成员属性，或者在 ts 中通过类型反射来注入

#### You can inject member properties by passing the class constructor to the `@Inject` decorator, or by using TypeScript's type reflection.

```ts
// HomeController.ts
import type { HomeService } from '@/service/HomeService';
import { Controller, HttpMethod, Inject } from 'koa-use-decorator-route';
import { HomeService2, HomeService3 } from '@/service/HomeService';

@Controller('/home')
export class HomeController {
	// 如果不用非空断言 (!)，则 `tsconfig.json` 中必须开启 `strictPropertyInitialization`
	// If you do not use the non-null assertion operator (!), you must enable `strictPropertyInitialization` in `tsconfig.json`.
	@Inject()
	service!: HomeService;

	@Inject(HomeService2)
	service2!: HomeService2;

	// 当将类的构造函数作为参数传入 `@Inject` 装饰器时，TypeScript 类型也可以使用 `any`
	// This means that when passing a class constructor to the `@Inject` decorator, the TypeScript type can be specified as `any`.
	@Inject(HomeService3)
	service3: any;

	@HttpMethod.Get('/')
	async index() {
		return this.service.show();
	}

	@HttpMethod.Get('/service2')
	async index2() {
		return this.service2.show();
	}

	@HttpMethod.Get('/service3')
	async index3() {
		return this.service3.show();
	}
}

// HomeService.ts
export class HomeService {
	show() {
		return 'Hello World!';
	}
}

export class HomeService2 {
	show() {
		return 'Hello World 2!';
	}
}

export class HomeService3 {
	show() {
		return 'Hello World 3!';
	}
}
```

- ### 控制器基础路径覆盖 / Controller Base Path Override (>= 0.1.0)

```ts
import { Controller, HttpMethod, ControllerBasePathOverride } from 'koa-use-decorator-route';

@Controller('/home')
export class HomeController {
	@ControllerBasePathOverride()
	@HttpMethod.Get('/home2/:name')
	async string(@Inject('name') name: string) {
		return `Hello ${name}`;
	}
}
```
