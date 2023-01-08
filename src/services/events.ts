import { State } from "../state/state";
import { EventBusKey, useEventBus as origUseEventBus, UseEventBusReturn } from "@vueuse/core";
import { PatternReference } from "../state/song";

const events = {
	"history-load-encoded-string": Symbol() as EventBusKey<void>,
	"overview-close-pattern-list": Symbol() as EventBusKey<void>,
	"compose": Symbol() as EventBusKey<void>,
	"overview-compose": Symbol() as EventBusKey<void>,
	"overview-listen": Symbol() as EventBusKey<void>,
	"pattern-placeholder-drag-start": Symbol() as EventBusKey<void>,
	"pattern-placeholder-drag-end": Symbol() as EventBusKey<void>,
	"update-available": Symbol() as EventBusKey<void>,
	"new-state": Symbol() as EventBusKey<State>,
	"listen": Symbol() as EventBusKey<string>,
	"edit-pattern": Symbol() as EventBusKey<{
		pattern: PatternReference;
		readonly: boolean;
		handled?: boolean;
	}>,
	"pattern-list-tune-opened": Symbol() as EventBusKey<string>,
	"pattern-list-tune-closed": Symbol() as EventBusKey<string>,
	"pattern-list-open-tune": Symbol() as EventBusKey<string>
};

export type EventBus<K extends keyof typeof events> = typeof events[K] extends EventBusKey<infer T> ? UseEventBusReturn<T, never> : never;

export function useEventBus<K extends keyof typeof events>(key: K): EventBus<K> {
	return origUseEventBus(key) as EventBus<K>;
}
