import { expect, test, vi } from "vitest";
import * as z from "zod";
import { computedProperties, numberRecordValidator, requiredRecordValidator } from "../utils";
import { Ref, reactive, ref } from "vue";

test('numberKeyValidator', () => {
	const record = numberRecordValidator(z.literal('val'));

	// Test valid object
	expect(record.parse({ 1: 'val' })).toEqual({ 1: 'val' });

	// Test additional key
	expect(record.parse({ 1: 'val', 'test': 'val' })).toEqual({ 1: 'val' });

	// Test invalid value
	expect(() => record.parse({ 1: 'val2' })).toThrow('Invalid literal value');

	// Test intersection type (with additional key)
	expect(record.and(z.object({ test: z.literal('val2') })).parse({ 1: 'val', test: 'val2', test2: 'val3' })).toEqual({ 1: 'val', test: 'val2' });

	// Test intersection type (with additional key with wrong value)
	expect(() => record.and(z.object({ test: z.literal('val2') })).parse({ 1: 'val', test: 'val3' })).toThrow('Invalid literal value');
});

test('requiredRecordValidator', () => {
	const record = requiredRecordValidator(['one', 'two'], z.literal('val'));

	// Test valid object
	expect(record.parse({ one: 'val', two: 'val' })).toEqual({ one: 'val', two: 'val' });

	// Test additional property being ignored
	expect(record.parse({ one: 'val', two: 'val', three: 'val' })).toEqual({ one: 'val', two: 'val' });

	// Test missing key
	expect(() => record.parse({ one: 'val' })).toThrow('Invalid literal value');

	// Test invalid value
	expect(() => record.parse({ one: 'val2', two: 'val' })).toThrow('Invalid literal value');
});


test('computedProperties', () => {
	const obj: Ref<Record<string, number>> = ref({ a: 1, b: 2 });
	const res = computedProperties(obj, (v) => v + 1);
	expect(res).toEqual({ a: 2, b: 3 });

	obj.value.a = 4;
	obj.value.b = 5;
	expect(res).toEqual({ a: 5, b: 6 });

	delete obj.value.b;
	obj.value.c = 10;
	expect(res).toEqual({ a: 5, c: 11 });

	obj.value = { y: 20, z: 30 };
	expect(res).toEqual({ y: 21, z: 31 });
});

test('nested computed properties', () => {
	const nestedObj = reactive({ a: 1 });
	const nestedGetter = vi.fn((v: number) => v + 1);

	const obj: Ref<Record<string, Record<string, number>>> = ref({ a: nestedObj });
	const res = computedProperties(obj, (v) => computedProperties(v, nestedGetter));
	expect(res).toEqual({ a: { a: 2 } });
	expect(nestedGetter).toBeCalledTimes(1);
	nestedGetter.mockClear();

	nestedObj.a = 2;
	expect(res).toEqual({ a: { a: 3 } });
	expect(nestedGetter).toBeCalledTimes(1);
	nestedGetter.mockClear();

	// Clear obj.value, make sure that watcher registered on nestedObj is unregistered
	obj.value = {};
	nestedObj.a = 3;
	expect(res).toEqual({});
	expect(nestedGetter).toBeCalledTimes(0);
	nestedGetter.mockClear();
});