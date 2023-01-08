import { expect, test } from "@jest/globals";
import * as z from "zod";
import { numberRecordValidator, requiredRecordValidator } from "../utils";

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
