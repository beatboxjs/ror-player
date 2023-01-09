import Vue from "vue";
import { PatternReference, State } from "../state/state";

type Event0 = {
	"history-load-encoded-string": void,
	"overview-close-pattern-list": void,
	"compose": void,
	"overview-compose": void,
	"overview-listen": void,
	"pattern-placeholder-drag-start": void,
	"pattern-placeholder-drag-end": void,
	"update-available": void
};

type Event1 = {
	"new-state": State,
	"listen": string,
	"edit-pattern": {
		pattern: PatternReference,
		readonly: boolean,
		handled?: boolean
	},
	"edit-pattern-command": {
		pattern: PatternReference,
		readonly: boolean,
		handled?: boolean
	},
	"pattern-list-tune-opened": string,
	"pattern-list-tune-closed": string,
	"pattern-list-open-tune": string
};

type Handler0<That> = (this: That) => void;

type Handler1<That, T extends keyof Event1> = (this: That, data: Event1[T]) => void;

export type MultipleHandlers<That> = {
	[T in keyof Event0]?: Handler0<That>;
} | {
	[T in keyof Event1]?: Handler1<That, T>;
};

interface EventBus {
	$on<T extends keyof Event0>(event: T, callback: Handler0<any>): void;
	$on<T extends keyof Event1>(event: T, callback: Handler1<any, T>): void;
	$on(handlers: MultipleHandlers<any>): void;

	$once<T extends keyof Event0>(event: T, callback: Handler0<any>): void;
	$once<T extends keyof Event1>(event: T, callback: Handler1<any, T>): void;
	$once(handlers: MultipleHandlers<any>): void;

	$off<T extends keyof Event0>(event: T, callback: Handler0<any>): void;
	$off<T extends keyof Event1>(event: T, callback: Handler1<any, T>): void;
	$off(handlers: MultipleHandlers<any>): void;

	$emit<T extends keyof Event0>(event: T): void;
	$emit<T extends keyof Event1>(event: T, data: Event1[T]): void;
}

const events: EventBus = new Vue();
export default events;

export function registerMultipleHandlers<That extends Vue>(handlers: MultipleHandlers<That>, bind: That) {
	const bound: any = { };
	for(const i of Object.keys(handlers)) {
		bound[i] = (handlers as any)[i].bind(bind);
		events.$on(i as any, bound[i]);
	}

	return () => {
		unregisterMultipleHandlers(bound);
	};
}

function unregisterMultipleHandlers(handlers: MultipleHandlers<any>) {
	for(const i of Object.keys(handlers)) {
		events.$off(i as any, (handlers as any)[i]);
	}
}