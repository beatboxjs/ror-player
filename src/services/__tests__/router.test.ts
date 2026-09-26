import { expect, test } from "vitest";
import { ref } from "vue";
import { useRouter } from "../router";

test("practice route is recognized", () => {
	const path = ref("/practice/Funk/Tune");
	const route = useRouter(path);
	expect(route.value.tab).toBe("practice");
	if (route.value.tab === "practice") {
		expect(route.value.tuneName).toBe("Funk");
		expect(route.value.patternName).toBe("Tune");
	}
});

test("practice root", () => {
	const path = ref("/practice/");
	const route = useRouter(path);
	expect(route.value.tab).toBe("practice");
});

test("practice tune-only (no pattern)", () => {
	const path = ref("/practice/Funk/");
	const route = useRouter(path);
	expect(route.value.tab).toBe("practice");
	if (route.value.tab === "practice") {
		expect(route.value.tuneName).toBe("Funk");
		expect(route.value.patternName).toBeUndefined();
	}
});
