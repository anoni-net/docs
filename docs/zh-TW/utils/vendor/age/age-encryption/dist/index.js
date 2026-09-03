import { hmac } from "@noble/hashes/hmac.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { randomBytes } from "@noble/hashes/utils.js";
import { HybridIdentity, HybridRecipient } from "./recipients.js";
import { ScryptIdentity, ScryptRecipient } from "./recipients.js";
import { X25519Identity, X25519Recipient } from "./recipients.js";
import { TagRecipient, HybridTagRecipient } from "./recipients.js";
import { encodeHeader, encodeHeaderNoMAC, parseHeader, Stanza } from "./format.js";
import { ciphertextSize, decryptSTREAM, encryptSTREAM, plaintextSize } from "./stream.js";
import { readAll, stream, read, readAllString, prepend } from "./io.js";
export * as armor from "./armor.js";
export * as webauthn from "./webauthn.js";
export { Stanza };
export { generateIdentity, generateHybridIdentity, generateX25519Identity, identityToRecipient } from "./recipients.js";
/**
 * Encrypts a file using the given passphrase or recipients.
 *
 * First, call {@link Encrypter.setPassphrase} to set a passphrase for symmetric
 * encryption, or {@link Encrypter.addRecipient} to specify one or more
 * recipients. Then, call {@link Encrypter.encrypt} one or more times to encrypt
 * files using the configured passphrase or recipients.
 */
export class Encrypter {
    passphrase = null;
    scryptWorkFactor = 18;
    recipients = [];
    /**
     * Set the passphrase to encrypt the file(s) with. This method can only be
     * called once, and can't be called if {@link Encrypter.addRecipient} has
     * been called.
     *
     * The passphrase is passed through the scrypt key derivation function, but
     * it needs to have enough entropy to resist offline brute-force attacks.
     * You should use at least 8-10 random alphanumeric characters, or 4-5
     * random words from a list of at least 2000 words.
     *
     * @param s - The passphrase to encrypt the file with.
     */
    setPassphrase(s) {
        if (this.passphrase !== null) {
            throw new Error("can encrypt to at most one passphrase");
        }
        if (this.recipients.length !== 0) {
            throw new Error("can't encrypt to both recipients and passphrases");
        }
        this.passphrase = s;
    }
    /**
     * Set the scrypt work factor to use when encrypting the file(s) with a
     * passphrase. The default is 18. Using a lower value will require stronger
     * passphrases to resist offline brute-force attacks.
     *
     * @param logN - The base-2 logarithm of the scrypt work factor.
     */
    setScryptWorkFactor(logN) {
        this.scryptWorkFactor = logN;
    }
    /**
     * Add a recipient to encrypt the file(s) for. This method can be called
     * multiple times to encrypt the file(s) for multiple recipients.
     *
     * This version supports native X25519 recipients (`age1...`), hybrid
     * post-quantum recipients (`age1pq1...`), tag recipients (`age1tag1...`),
     * and hybrid tag recipients (`age1tagpq1...`).
     *
     * @param s - The recipient to encrypt the file for. Either a string
     * beginning with `age1...` or an object implementing the {@link Recipient}
     * interface.
     */
    addRecipient(s) {
        if (this.passphrase !== null) {
            throw new Error("can't encrypt to both recipients and passphrases");
        }
        if (typeof s === "string") {
            if (s.startsWith("age1pq1")) {
                this.recipients.push(new HybridRecipient(s));
            }
            else if (s.startsWith("age1tag1")) {
                this.recipients.push(new TagRecipient(s));
            }
            else if (s.startsWith("age1tagpq1")) {
                this.recipients.push(new HybridTagRecipient(s));
            }
            else if (s.startsWith("age1")) {
                this.recipients.push(new X25519Recipient(s));
            }
            else {
                throw new Error("unrecognized recipient type");
            }
        }
        else {
            this.recipients.push(s);
        }
    }
    async encrypt(file) {
        const fileKey = randomBytes(16);
        const stanzas = [];
        let recipients = this.recipients;
        if (this.passphrase !== null) {
            recipients = [new ScryptRecipient(this.passphrase, this.scryptWorkFactor)];
        }
        for (const recipient of recipients) {
            stanzas.push(...await recipient.wrapFileKey(fileKey));
        }
        const labelHeader = new TextEncoder().encode("header");
        const hmacKey = hkdf(sha256, fileKey, undefined, labelHeader, 32);
        const mac = hmac(sha256, hmacKey, encodeHeaderNoMAC(stanzas));
        const header = encodeHeader(stanzas, mac);
        const nonce = randomBytes(16);
        const labelPayload = new TextEncoder().encode("payload");
        const streamKey = hkdf(sha256, fileKey, nonce, labelPayload, 32);
        const encrypter = encryptSTREAM(streamKey);
        if (!(file instanceof ReadableStream)) {
            if (typeof file === "string")
                file = new TextEncoder().encode(file);
            return await readAll(prepend(stream(file).pipeThrough(encrypter), header, nonce));
        }
        return Object.assign(prepend(file.pipeThrough(encrypter), header, nonce), {
            size: (size) => ciphertextSize(size) + header.length + nonce.length
        });
    }
}
/**
 * Decrypts a file using the given identities.
 *
 * First, call {@link Decrypter.addPassphrase} to set a passphrase for symmetric
 * decryption, and/or {@link Decrypter.addIdentity} to specify one or more
 * identities. All passphrases and/or identities are tried in parallel for each
 * file. Then, call {@link Decrypter.decrypt} one or more times to decrypt files
 * using the configured passphrase and/or identities.
 */
export class Decrypter {
    identities = [];
    /**
     * Add a passphrase to decrypt password-encrypted file(s) with. This method
     * can be called multiple times to try multiple passphrases.
     *
     * @param s - The passphrase to decrypt the file with.
     */
    addPassphrase(s) {
        this.identities.push(new ScryptIdentity(s));
    }
    /**
     * Add an identity to decrypt file(s) with. This method can be called
     * multiple times to try multiple identities.
     *
     * @param s - The identity to decrypt the file with. Either a string
     * beginning with `AGE-SECRET-KEY-PQ-1...` or `AGE-SECRET-KEY-1...`, an
     * X25519 private
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey | CryptoKey}
     * object, or an object implementing the {@link Identity} interface.
     *
     * A CryptoKey object must have
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey/type | type}
     * `private`,
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey/algorithm | algorithm}
     * `{name: 'X25519'}`, and
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey/usages | usages}
     * `["deriveBits"]`. For example:
     * ```js
     * const keyPair = await crypto.subtle.generateKey({ name: "X25519" }, false, ["deriveBits"])
     * decrypter.addIdentity(key.privateKey)
     * ```
     */
    addIdentity(s) {
        if (isCryptoKey(s)) {
            this.identities.push(new X25519Identity(s));
        }
        else if (typeof s === "string") {
            if (s.startsWith("AGE-SECRET-KEY-1")) {
                this.identities.push(new X25519Identity(s));
            }
            else if (s.startsWith("AGE-SECRET-KEY-PQ-1")) {
                this.identities.push(new HybridIdentity(s));
            }
            else {
                throw new Error("unrecognized identity type");
            }
        }
        else {
            this.identities.push(s);
        }
    }
    async decrypt(file, outputFormat) {
        const s = file instanceof ReadableStream ? file : stream(file);
        const { fileKey, headerSize, rest } = await this.decryptHeaderInternal(s);
        const { data: nonce, rest: payload } = await read(rest, 16);
        const label = new TextEncoder().encode("payload");
        const streamKey = hkdf(sha256, fileKey, nonce, label, 32);
        const decrypter = decryptSTREAM(streamKey);
        const out = payload.pipeThrough(decrypter);
        const outWithSize = Object.assign(out, {
            size: (size) => plaintextSize(size - headerSize - nonce.length)
        });
        if (file instanceof ReadableStream)
            return outWithSize;
        if (outputFormat === "text")
            return await readAllString(out);
        return await readAll(out);
    }
    /**
     * Decrypt the file key from a detached header. This is a low-level
     * function that can be used to implement delegated decryption logic.
     * Most users won't need this.
     *
     * It is the caller's responsibility to keep track of what file the
     * returned file key decrypts, and to ensure the file key is not used
     * for any other purpose.
     *
     * @param header - The file's textual header, including the MAC.
     *
     * @returns The file key used to encrypt the file.
     */
    async decryptHeader(header) {
        return (await this.decryptHeaderInternal(stream(header))).fileKey;
    }
    async decryptHeaderInternal(file) {
        const h = await parseHeader(file);
        const fileKey = await this.unwrapFileKey(h.stanzas);
        if (fileKey === null)
            throw Error("no identity matched any of the file's recipients");
        const label = new TextEncoder().encode("header");
        const hmacKey = hkdf(sha256, fileKey, undefined, label, 32);
        const mac = hmac(sha256, hmacKey, h.headerNoMAC);
        if (!compareBytes(h.MAC, mac))
            throw Error("invalid header HMAC");
        return { fileKey, headerSize: h.headerSize, rest: h.rest };
    }
    async unwrapFileKey(stanzas) {
        for (const identity of this.identities) {
            const fileKey = await identity.unwrapFileKey(stanzas);
            if (fileKey !== null)
                return fileKey;
        }
        return null;
    }
}
function compareBytes(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let acc = 0;
    for (let i = 0; i < a.length; i++) {
        acc |= a[i] ^ b[i];
    }
    return acc === 0;
}
function isCryptoKey(key) {
    return typeof CryptoKey !== "undefined" && key instanceof CryptoKey;
}
