import { bech32, base64nopad } from "@scure/base";
import { randomBytes } from "@noble/hashes/utils.js";
import { extract } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import {} from "./index.js";
import { Stanza } from "./format.js";
import { decryptFileKey, encryptFileKey } from "./recipients.js";
import * as cbor from "./cbor.js";
// We don't actually use the public key, so declare support for all default
// algorithms that might be supported by authenticators.
const defaultAlgorithms = [
    { type: "public-key", alg: -8 }, // Ed25519
    { type: "public-key", alg: -7 }, // ECDSA with P-256 and SHA-256
    { type: "public-key", alg: -257 }, // RSA PKCS#1 v1.5 with SHA-256
];
/**
 * Creates a new WebAuthn credential which can be used for encryption and
 * decryption.
 *
 * @returns The identity string to use for encryption or decryption.
 *
 * This string begins with `AGE-PLUGIN-FIDO2PRF-1...` and encodes the credential ID,
 * the relying party ID, and the transport hint.
 *
 * If the credential was created with {@link CreationOptions."type"} set to the
 * default `passkey`, this string is mostly a hint to make selecting the
 * credential easier. If the credential was created with `security-key`, this
 * string is required to encrypt and decrypt files, and can't be regenerated if
 * lost.
 *
 * @see {@link Options.identity}
 * @experimental
 */
export async function createCredential(options) {
    const cred = await navigator.credentials.create({
        publicKey: {
            rp: { name: "", id: options.rpId },
            user: {
                name: options.keyName,
                id: domBuffer(randomBytes(8)), // avoid overwriting existing keys
                displayName: "",
            },
            pubKeyCredParams: defaultAlgorithms,
            authenticatorSelection: {
                requireResidentKey: options.type !== "security-key",
                residentKey: options.type !== "security-key" ? "required" : "discouraged",
                userVerification: "required", // prf requires UV
            },
            hints: options.type === "security-key" ? ["security-key"] : [],
            extensions: { prf: {} },
            challenge: new Uint8Array([0]).buffer, // unused without attestation
        },
    });
    if (!cred.getClientExtensionResults().prf?.enabled) {
        throw Error("PRF extension not available (need macOS 15+, Chrome 132+)");
    }
    // Annoyingly, it doesn't seem possible to get the RP ID from the
    // credential, so we have to hope we get the default right.
    const rpId = options.rpId ?? new URL(window.origin).hostname;
    return encodeIdentity(cred, rpId);
}
const prefix = "AGE-PLUGIN-FIDO2PRF-";
function encodeIdentity(credential, rpId) {
    const res = credential.response;
    const version = cbor.encodeUint(1);
    const credId = cbor.encodeByteString(new Uint8Array(credential.rawId));
    const rp = cbor.encodeTextString(rpId);
    const transports = cbor.encodeArray(res.getTransports());
    const identityData = new Uint8Array([...version, ...credId, ...rp, ...transports]);
    return bech32.encode(prefix, bech32.toWords(identityData), false).toUpperCase();
}
function decodeIdentity(identity) {
    const { words } = bech32.decode(identity, false);
    const bytes = bech32.fromWords(words);
    if (!identity.startsWith(prefix + "1")) {
        throw Error("invalid identity");
    }
    const [version, rest1] = cbor.readUint(bytes);
    if (version !== 1) {
        throw Error("unsupported identity version");
    }
    const [credId, rest2] = cbor.readByteString(rest1);
    const [rpId, rest3] = cbor.readTextString(rest2);
    const [transports,] = cbor.readArray(rest3);
    return [credId, rpId, transports];
}
const label = "age-encryption.org/fido2prf";
class WebAuthnInternal {
    credId;
    transports;
    rpId;
    constructor(options) {
        if (options?.identity) {
            const [credId, rpId, transports] = decodeIdentity(options.identity);
            this.credId = credId;
            this.transports = transports;
            this.rpId = rpId;
        }
        else {
            this.rpId = options?.rpId;
        }
    }
    async getCredential(nonce) {
        const assertion = await navigator.credentials.get({
            publicKey: {
                allowCredentials: this.credId ? [{
                        id: domBuffer(this.credId),
                        transports: this.transports,
                        type: "public-key"
                    }] : [],
                challenge: domBuffer(randomBytes(16)),
                extensions: { prf: { eval: prfInputs(nonce) } },
                userVerification: "required", // prf requires UV
                rpId: this.rpId,
            },
        });
        const results = assertion.getClientExtensionResults().prf?.results;
        if (results === undefined) {
            throw Error("PRF extension not available (need macOS 15+, Chrome 132+)");
        }
        return results;
    }
}
// For the WebAuthnRecipient and WebAuthnIdentity TSDoc links.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {} from "./index.js";
/**
 * A {@link Recipient} that symmetrically encrypts file keys using a WebAuthn
 * credential, such as a passkey or a security key.
 *
 * The credential needs to already exist, and support the PRF extension.
 * Usually, it would have been created with {@link createCredential}.
 *
 * @see {@link Encrypter.addRecipient}
 * @experimental
 */
export class WebAuthnRecipient extends WebAuthnInternal {
    /**
     * Implements {@link Recipient.wrapFileKey}.
     */
    async wrapFileKey(fileKey) {
        const nonce = randomBytes(16);
        const results = await this.getCredential(nonce);
        const key = deriveKey(results);
        return [new Stanza([label, base64nopad.encode(nonce)], encryptFileKey(fileKey, key))];
    }
}
/**
 * An {@link Identity} that symmetrically decrypts file keys using a WebAuthn
 * credential, such as a passkey or a security key.
 *
 * The credential needs to already exist, and support the PRF extension.
 * Usually, it would have been created with {@link createCredential}.
 *
 * @see {@link Decrypter.addIdentity}
 * @experimental
 */
export class WebAuthnIdentity extends WebAuthnInternal {
    /**
     * Implements {@link Identity.unwrapFileKey}.
     */
    async unwrapFileKey(stanzas) {
        for (const s of stanzas) {
            if (s.args.length < 1 || s.args[0] !== label) {
                continue;
            }
            if (s.args.length !== 2) {
                throw Error("invalid prf stanza");
            }
            const nonce = base64nopad.decode(s.args[1]);
            if (nonce.length !== 16) {
                throw Error("invalid prf stanza");
            }
            const results = await this.getCredential(nonce);
            const key = deriveKey(results);
            const fileKey = decryptFileKey(s.body, key);
            if (fileKey !== null)
                return fileKey;
        }
        return null;
    }
}
// We use both first and second to prevent an attacker from decrypting two files
// at once with a single user presence check.
function prfInputs(nonce) {
    const prefix = new TextEncoder().encode(label);
    const first = new Uint8Array(prefix.length + nonce.length + 1);
    first.set(prefix, 0);
    first[prefix.length] = 0x01;
    first.set(nonce, prefix.length + 1);
    const second = new Uint8Array(prefix.length + nonce.length + 1);
    second.set(prefix, 0);
    second[prefix.length] = 0x02;
    second.set(nonce, prefix.length + 1);
    return { first, second };
}
function deriveKey(results) {
    if (results.second === undefined) {
        throw Error("Missing second PRF result");
    }
    const first = prfResultToBytes(results.first);
    const second = prfResultToBytes(results.second);
    const prf = new Uint8Array(first.byteLength + second.byteLength);
    prf.set(first, 0);
    prf.set(second, first.byteLength);
    return extract(sha256, prf, new TextEncoder().encode(label));
}
function prfResultToBytes(result) {
    if (result instanceof ArrayBuffer) {
        return new Uint8Array(result);
    }
    if (ArrayBuffer.isView(result)) {
        return new Uint8Array(result.buffer, result.byteOffset, result.byteLength);
    }
    // This is for the noncompliant 1Password browser extension that returns a number
    // array instead of a BufferSource. See https://github.com/FiloSottile/typage/pull/50.
    if (Array.isArray(result)) {
        return Uint8Array.from(result);
    }
    throw Error("PRF result is not a BufferSource");
}
// TypeScript 5.9+ made Uint8Array generic, defaulting to Uint8Array<ArrayBufferLike>.
// DOM APIs like WebAuthn require Uint8Array<ArrayBuffer> (no SharedArrayBuffer).
// This helper narrows the type while still catching non-Uint8Array arguments.
function domBuffer(arr) {
    return arr;
}
