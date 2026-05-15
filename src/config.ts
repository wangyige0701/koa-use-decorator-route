export const ROUTES = Symbol.for('koa-decorator-router#routes');

export const CONTROLLER = Symbol.for('koa-decorator-router#controller');

export const SINGLETON = Symbol.for('koa-decorator-router#singleton');

export const INJECT = Symbol.for('koa-decorator-router#inject');

export const INJECT_METHOD = Symbol.for('koa-decorator-router#inject-method');

export const RESPONSE_HEADER = Symbol.for('koa-decorator-router#response-header');

/** 路由响应头优先触发 */
export const RESPONSE_HEADER_TOP = Symbol.for('koa-decorator-router#response-header#top');

export const RESPONSE_GLOBAL_HEADER = Symbol.for('koa-decorator-router#response-global-header');

/** 全局响应头优先触发 */
export const RESPONSE_GLOBAL_HEADER_TOP = Symbol.for('koa-decorator-router#response-global-header#top');

export const ROUTE_OVERRIDE = Symbol.for('koa-decorator-router#route-override');

/** 记录所有路由的中间件 */
export const ROUTE_MIDDLEWARES = Symbol.for('koa-decorator-router#route-middlewares');

/** 记录路由的名称 */
export const ROUTE_NAME = Symbol.for('koa-decorator-router#route-name');

/** 记录路由的方法 */
export const ROUTE_METHOD = Symbol.for('koa-decorator-router#route-method');

/** 记录路由的跨域配置 */
export const ROUTE_CORS = Symbol.for('koa-decorator-router#route-cors');
