import type { Decorator } from '@/@types';

class IFDecorator {
	private state: 'IF' | 'ELIF' | 'ELSE' = 'IF';
	private decorator?: Decorator;

	constructor(
		private condition: boolean,
		decorator: Decorator,
	) {
		this.assertDecorator(decorator);
	}

	ELSE(decorator: Decorator) {
		this.state = 'ELSE';
		if (this.condition) {
			return this;
		}
		this.condition = true;
		this.assertDecorator(decorator);
		return this;
	}

	ELIF(condition: boolean, decorator: Decorator) {
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

	private assertDecorator(decorator: Decorator) {
		if (this.condition) {
			this.decorator = decorator;
		} else {
			this.decorator = this.nullDecorator();
		}
	}

	private nullDecorator(): Decorator {
		return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor | number) => {
			if (!propertyKey) {
				return target;
			}
			if (typeof descriptor !== 'number') {
				return descriptor;
			}
		};
	}
}

export function IF(condition: boolean, decorator: Decorator) {
	return new IFDecorator(condition, decorator);
}
