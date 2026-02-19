import LZString from 'lz-string';

// Simple Linear Congruential Generator for seeded randomness
export class SeededRNG {
    seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    // Returns number between 0 and 1
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

// Custom Alphabet excluding I, l, 1, O, 0 to prevent transcription errors
export const SAFE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE = BigInt(SAFE_ALPHABET.length);

/**
 * Encodes a JSON-serializable object into a compressed Base56 string.
 */
export const encodeSave = (data: any): string => {
    try {
        const jsonString = JSON.stringify(data);
        const compressed = LZString.compressToUint8Array(jsonString);
        
        // Convert Uint8Array to BigInt for Base56 encoding
        let value = 0n;
        for (const byte of compressed) {
            value = (value << 8n) + BigInt(byte);
        }
        
        let result = "";
        if (value === 0n) return SAFE_ALPHABET[0];

        while (value > 0n) {
            const mod = value % BASE;
            result = SAFE_ALPHABET[Number(mod)] + result;
            value = value / BASE;
        }
        return result;
    } catch (e) {
        console.error("Save encoding failed", e);
        return "";
    }
};

/**
 * Decodes a Base56 string back into a JSON object.
 */
export const decodeSave = (code: string): any => {
    try {
        let value = 0n;
        for (const char of code) {
            const index = SAFE_ALPHABET.indexOf(char);
            if (index === -1) throw new Error("Invalid character in save code");
            value = value * BASE + BigInt(index);
        }

        const bytes: number[] = [];
        if (value === 0n) bytes.push(0);
        
        while (value > 0n) {
            bytes.unshift(Number(value & 255n));
            value = value >> 8n;
        }

        const uint8 = new Uint8Array(bytes);
        const jsonString = LZString.decompressFromUint8Array(uint8);
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Load decoding failed", e);
        return null;
    }
};
