/**
 * Utilities for hex, bytearray and number handling.
 * @module
 */
/*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) */
import { abytes, abytes as abytes_, concatBytes, isBytes, randomBytes as randb, } from '@noble/hashes/utils.js';
export { abytes } from '@noble/hashes/utils.js';
export { concatBytes };
export const randomBytes = randb;
// Compares 2 u8a-s in kinda constant time
export function equalBytes(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
        diff |= a[i] ^ b[i];
    return diff === 0;
}
// copy bytes to new u8a (aligned). Because Buffer.slice is broken.
export function copyBytes(bytes) {
    return Uint8Array.from(bytes);
}
export function validateOpts(opts) {
    // We try to catch u8a, since it was previously valid argument at this position
    if (typeof opts !== 'object' || opts === null || isBytes(opts))
        throw new Error('expected opts to be an object');
}
export function validateVerOpts(opts) {
    validateOpts(opts);
    if (opts.context !== undefined)
        abytes(opts.context, undefined, 'opts.context');
}
export function validateSigOpts(opts) {
    validateVerOpts(opts);
    if (opts.extraEntropy !== false && opts.extraEntropy !== undefined)
        abytes(opts.extraEntropy, undefined, 'opts.extraEntropy');
}
export function splitCoder(label, ...lengths) {
    const getLength = (c) => (typeof c === 'number' ? c : c.bytesLen);
    const bytesLen = lengths.reduce((sum, a) => sum + getLength(a), 0);
    return {
        bytesLen,
        encode: (bufs) => {
            const res = new Uint8Array(bytesLen);
            for (let i = 0, pos = 0; i < lengths.length; i++) {
                const c = lengths[i];
                const l = getLength(c);
                const b = typeof c === 'number' ? bufs[i] : c.encode(bufs[i]);
                abytes_(b, l, label);
                res.set(b, pos);
                if (typeof c !== 'number')
                    b.fill(0); // clean
                pos += l;
            }
            return res;
        },
        decode: (buf) => {
            abytes_(buf, bytesLen, label);
            const res = [];
            for (const c of lengths) {
                const l = getLength(c);
                const b = buf.subarray(0, l);
                res.push(typeof c === 'number' ? b : c.decode(b));
                buf = buf.subarray(l);
            }
            return res;
        },
    };
}
// nano-packed.array (fixed size)
export function vecCoder(c, vecLen) {
    const bytesLen = vecLen * c.bytesLen;
    return {
        bytesLen,
        encode: (u) => {
            if (u.length !== vecLen)
                throw new Error(`vecCoder.encode: wrong length=${u.length}. Expected: ${vecLen}`);
            const res = new Uint8Array(bytesLen);
            for (let i = 0, pos = 0; i < u.length; i++) {
                const b = c.encode(u[i]);
                res.set(b, pos);
                b.fill(0); // clean
                pos += b.length;
            }
            return res;
        },
        decode: (a) => {
            abytes_(a, bytesLen);
            const r = [];
            for (let i = 0; i < a.length; i += c.bytesLen)
                r.push(c.decode(a.subarray(i, i + c.bytesLen)));
            return r;
        },
    };
}
// cleanBytes(Uint8Array.of(), [Uint16Array.of(), Uint32Array.of()])
export function cleanBytes(...list) {
    for (const t of list) {
        if (Array.isArray(t))
            for (const b of t)
                b.fill(0);
        else
            t.fill(0);
    }
}
export function getMask(bits) {
    return (1 << bits) - 1; // 4 -> 0b1111
}
export const EMPTY = Uint8Array.of();
export function getMessage(msg, ctx = EMPTY) {
    abytes_(msg);
    abytes_(ctx);
    if (ctx.length > 255)
        throw new Error('context should be less than 255 bytes');
    return concatBytes(new Uint8Array([0, ctx.length]), ctx, msg);
}
// 06 09 60 86 48 01 65 03 04 02
const oidNistP = /* @__PURE__ */ Uint8Array.from([6, 9, 0x60, 0x86, 0x48, 1, 0x65, 3, 4, 2]);
export function checkHash(hash, requiredStrength = 0) {
    if (!hash.oid || !equalBytes(hash.oid.subarray(0, 10), oidNistP))
        throw new Error('hash.oid is invalid: expected NIST hash');
    const collisionResistance = (hash.outputLen * 8) / 2;
    if (requiredStrength > collisionResistance) {
        throw new Error('Pre-hash security strength too low: ' +
            collisionResistance +
            ', required: ' +
            requiredStrength);
    }
}
export function getMessagePrehash(hash, msg, ctx = EMPTY) {
    abytes_(msg);
    abytes_(ctx);
    if (ctx.length > 255)
        throw new Error('context should be less than 255 bytes');
    const hashed = hash(msg);
    return concatBytes(new Uint8Array([1, ctx.length]), ctx, hash.oid, hashed);
}
//# sourceMappingURL=utils.js.map