import type { Decorator } from '@/@types';

class IFDecorator<T extends Decorator> {
	private state: 'IF' | 'ELIF' | 'ELSE' = 'IF';
	private decorator?: T;

	constructor(
		private condition: boolean,
		decorator: T,
	) {
		this.assertDecorator(decorator);
	}

	ELSE(decorator: T) {
		this.state = 'ELSE';
		if (this.condition) {
			return this;
		}
		this.condition = true;
		this.assertDecorator(decorator);
		return this;
	}

	ELIF(condition: boolean, decorator: T) {
		if (this.state === 'ELSE') {
			return this;
		}
		this.state = 'ELIF';
		if (this.condition) {
			return this;
		}
		this.condition = condition;
		if (!this.condition) {
			return this;
		}
		this.assertDecorator(decorator);
		return this;
	}

	ENDIF() {
		return this.decorator!;
	}

	private assertDecorator(decorator: T) {
		if (this.condition) {
			this.decorator = decorator;
		} else {
			this.decorator = this.nullDecorator();
		}
	}

	private nullDecorator(): T {
		function result(target: any): any;
		function result(target: Object, propertyKey: string | symbol): void;
		function result(
			target: Object,
			propertyKey: string | symbol,
			descriptor: TypedPropertyDescriptor<any>,
		): TypedPropertyDescriptor<any> | void;
		function result(target: Object, propertyKey: string | symbol | undefined, parameterIndex: number): void;
		function result(
			target: any,
			propertyKey?: string | symbol | undefined,
			descriptor?: PropertyDescriptor | number,
		): any {
			if (!propertyKey) {
				return target;
			}
			if (typeof descriptor !== 'number') {
				return descriptor;
			}
		}
		return result as T;
	}
}

export function IF<T extends Decorator>(condition: boolean, decorator: T) {
	return new IFDecorator<T>(condition, decorator);
}
