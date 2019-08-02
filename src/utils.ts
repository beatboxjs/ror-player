import { inflateRaw, deflateRaw } from "pako";
import { Instrument } from "./config";

export type TypedObject<Type> = {
    [key: string]: Type
};

export type TypedNumberObject<Type> = {
    [key: number]: Type
};

export type TypedInstrumentObject<Type> = {
    [instr in Instrument]: Type
};

export const NUMBER_TO_STRING_CHARS = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

export function getMaxIndex(arr: TypedNumberObject<any>): number | null {
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
export function numberToString(number: number, length?: number) {
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
    let decoded = atob(string.replace(/-/g, '+').replace(/_/g, '/'));
    if(decoded.charAt(0) != '{')
        decoded = inflateRaw(decoded, { to: "string" });
    if(decoded.charCodeAt(decoded.length-1) == 0) // Happened once, don't know why
        decoded = decoded.substr(0, decoded.length-1);
    return JSON.parse(decoded);
}

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

let idCounter = 0;
export function id() {
    return idCounter++;
}