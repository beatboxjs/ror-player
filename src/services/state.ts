import { inject, InjectionKey, provide, Ref } from "vue";
import { State } from "../state/state";

const stateInject = Symbol("stateInject") as InjectionKey<Ref<State>>;

export function provideState(stateRef: Ref<State>): void {
	provide(stateInject, stateRef);
}

export function injectStateOptional(): Ref<State> | undefined {
	return inject(stateInject);
}

export function injectStateRequired(): Ref<State> {
	const state = injectStateOptional();
	if (!state) {
		throw new Error("No state injected.");
	}
	return state;
}
