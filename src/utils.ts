import { inflateRaw, deflateRaw } from "pako";
import { decode } from "base64-arraybuffer";
import * as z from "zod";
import { AllowedComponentProps, ComponentPublicInstance, VNodeProps } from "vue";

export const NUMBER_TO_STRING_CHARS = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

export function getMaxIndex(arr: Record<number, any>): number | null {
    const keys = Object.keys(arr);
    let ret: number | null = null;
    for(let i=0; i<keys.length; i++) {
        const t = parseInt(keys[i]);
        if(!isNaN(t) && (ret == null || t > ret))
            ret = t;
    }
    return ret;
}

/**
 * Encodes a numbers as a string.
 * @param number {number} The number to encode.
 * @param length {number?} The number of bytes to use to represent the number (optional).
 * @returns {string} The number encoded as a string.
 */
export function numberToString(number: number, length?: number): string {
    if(number < 0 || isNaN(number) || !isFinite(number))
        throw new Error("Invalid number "+number);

    let ret = "";
    while(number > 0) {
        const newNumber = Math.floor(number / NUMBER_TO_STRING_CHARS.length);
        ret = NUMBER_TO_STRING_CHARS[number - newNumber*NUMBER_TO_STRING_CHARS.length] + ret;
        number = newNumber;
    }

    if(length != null) {
        if(ret.length > length)
            throw new Error("Number "+number+" larger than "+length+" bytes.");

        while(ret.length < length)
            ret = NUMBER_TO_STRING_CHARS[0] + ret;
    }
    return ret;
}

/**
 * Decodes a number encoded as a string.
 * @param string {string} An encoded number as returned by `_numberToString()`.
 * @returns {number} The decoded number.
 */
export function stringToNumber(string: string): number {
    let ret = 0;
    for(let i=string.length-1,fac=1; i>=0; i--,fac*=NUMBER_TO_STRING_CHARS.length) {
        const val = NUMBER_TO_STRING_CHARS.indexOf(string.charAt(i));
        if(val == -1)
            throw new Error("Unrecognised char "+string.charAt(i));

        ret += val*fac;
    }
    return ret;
}

export function objectToString(object: object): string {
    const uncompressed = JSON.stringify(object);
    const compressed = String.fromCharCode.apply(null, deflateRaw(uncompressed, { level: 9 }) as unknown as number[]);
    return btoa(uncompressed.length < compressed.length ? uncompressed : compressed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function stringToObject(string: string): object {
    const encoded = string.replace(/-/g, '+').replace(/_/g, '/');

    let decoded;
    if (atob(encoded.substr(0, 2)).charAt(0) == "{")
        decoded = atob(encoded);
    else {
        decoded = inflateRaw(new Uint8Array(decode(encoded)), { to: "string" });
        if(decoded.charCodeAt(decoded.length-1) == 0) // Happened once, don't know why
            decoded = decoded.substr(0, decoded.length-1);
    }

    return JSON.parse(decoded);
}

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

let idCounter = 0;
export function generateId(): number {
    return idCounter++;
}

export async function sleep(millis: number = 0): Promise<void> {
    await new Promise((resolve) => {
        setTimeout(resolve, millis);
    });
}

/**
 * Transform the result of a zod scheme to another type and validates that type against another zod scheme.
 * The result of this function basically equals inputSchema.transform((val) => outputSchema.parse(transformer(val))),
 * but errors thrown during the transformation are handled gracefully (since at the moment, zod transformers
 * do not natively support exceptions).
 */
export function transformValidator<Output, Input1, Input2, Input3>(inputSchema: z.ZodType<Input2, any, Input1>, transformer: (input: Input2) => Input3, outputSchema: z.ZodType<Output, any, Input3>): z.ZodEffects<z.ZodEffects<z.ZodType<Input2, any, Input1>, Input2>, Output> {
    // For now we have to parse the schema twice, since transform() is not allowed to throw exceptions.
    // See https://github.com/colinhacks/zod/pull/420
    return inputSchema.superRefine((val, ctx) => {
        try {
            const result = outputSchema.safeParse(transformer(val));
            if (!result.success) {
                for (const issue of result.error.errors) {
                    ctx.addIssue(issue);
                }
            }
        } catch (err: any) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: err.message,
            });
        }
    }).transform((val) => outputSchema.parse(transformer(val)));
}

/**
 * Returns a validator representing a Record<number, any>, picking only number keys from an object. zod does not support these
 * out of the box, since a record key is always a string and thus cannot be validated with z.number().
 */
export function numberRecordValidator<Value extends z.ZodTypeAny>(valueType: Value): z.ZodRecord<z.ZodType<number, any, number>, Value> {
    return transformValidator(z.record(z.any()), (value) => Object.fromEntries(Object.entries(value).filter(([key]) => !isNaN(Number(key)))), z.record(valueType)) as any;
}

/**
 * Returns a validator representing a record with a fixed set of keys, with all keys being required. Zod only supports enums with optional
 * values.
 * Invalid keys are removed from the parsed object, missing keys and invalid values raise errors.
 */
export function requiredRecordValidator<T extends [string, ...string[]], Value extends z.ZodTypeAny>(keys: T, valueType: Value): z.ZodObject<Record<T[number], Value>> {
    return z.object(Object.fromEntries(keys.map((key) => [key, valueType])) as Record<T[number], Value>);
}

export type ComponentProps<Component extends new (...args: any) => ComponentPublicInstance<any, any, any, any, any, any, any, any, any, any, any>> = Omit<InstanceType<Component>["$props"], keyof VNodeProps | keyof AllowedComponentProps>;
