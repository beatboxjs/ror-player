import mitt, { Emitter, Handler } from 'mitt';
import { inject, InjectionKey, onScopeDispose, provide } from 'vue';

type Events = {
	/** Indicates that the dragging of a pattern placeholder has started. */
	"pattern-placeholder-drag-start": void;
	/** Indicates that the dragging of a pattern placeholder has ended. */
	"pattern-placeholder-drag-end": void;

	/** Tells the Overview component to close the pattern list sidebar (on narrow screens). */
	"overview-close-pattern-list": void;

	/** Indicates that an encoded string has been loaded (through the URL hash), causing a new historic state to be created. */
	"history-load-encoded-string": void;
};

export type EventBus = Emitter<Events>;

const eventBusInject = Symbol("eventBusInject") as InjectionKey<Emitter<Events>>;

export function createEventBus(): Emitter<Events> {
	return mitt<Events>();
}

export function provideEventBus(eventBus: EventBus): void {
	provide(eventBusInject, eventBus);
}

export function injectEventBusOptional(): EventBus | undefined {
	return inject(eventBusInject);
}

export function injectEventBusRequired(): EventBus {
	const eventBus = injectEventBusOptional();
	if (!eventBus) {
		throw new Error("Event bus is not injected.");
	}
	return eventBus;
}

export function useEventBusListener<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void {
	const eventBus = injectEventBusRequired();
	eventBus.on(type, handler);
	onScopeDispose(() => {
		eventBus.off(type, handler);
	});
}
