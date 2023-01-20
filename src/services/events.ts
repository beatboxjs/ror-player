import mitt, { Emitter, Handler } from 'mitt';
import { PatternReference } from "../state/song";
import { inject, InjectionKey, onScopeDispose, provide } from 'vue';

type Events = {
	/** Indicates that the user has switched to the "Compose" tab in the Overview component. */
	"overview-compose": void;
	/** Indicates that the user has switched to the "Listen" tab in the Overview component. */
	"overview-listen": void;
	/** Indicates that the dragging of a pattern placeholder has started. */
	"pattern-placeholder-drag-start": void;
	/** Indicates that the dragging of a pattern placeholder has ended. */
	"pattern-placeholder-drag-end": void;
	/** Indicates that the user has expanded a tune in the Pattern List component. */
	"pattern-list-tune-opened": string;
	/** Indicates that the user has collapsed a tune in the Pattern List component. */
	"pattern-list-tune-closed": string;
	/** Indicates that the user has opened the pattern editor dialog. */
	"pattern-editor-opened": {
		pattern: PatternReference;
		readonly: boolean;
	};
	/** Indicates that the user has closed the pattern editor dialog. */
	"pattern-editor-closed": {
		pattern: PatternReference;
		readonly: boolean;
	};

	/** Tells the Overview component to close the pattern list sidebar (on narrow screens). */
	"overview-close-pattern-list": void;
	/** Tells the Overview component to switch to the "Compose" tab. */
	"compose": void;
	/** Tells the Overview component to switch to the "Listen" tab. The argument is name of the tune that should be opened. */
	"listen": string;
	/** Tells the Pattern Placeholder component to open the Edit Pattern dialog. */
	"edit-pattern": {
		pattern: PatternReference;
		readonly: boolean;
		/** This is set to true by the component when handling the event to prevent other component instances from handling it again. */
		handled?: boolean;
	};
	/** Tells the Pattern List component to expand a tune. */
	"pattern-list-open-tune": string;

	/** Indicates that an encoded string has been loaded (through the URL hash), causing a new historic state to be created. */
	"history-load-encoded-string": void;
	/** Indicates that the service worker has downloaded a new version of the app. */
	"update-available": void;
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
