import * as GraphenePkcs11 from "graphene-pk11";
import { getSession } from "./pkcs11.service";
import { findKey } from "./key-manager";

export function encryptAesGcm(keyLabel: string, plaintext: Buffer): {
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
} {
  const session = getSession();
  const key     = findKey(keyLabel, "secret");
  const iv      = Buffer.from(session.generateRandom(12));
  const dec = Buffer.alloc(plaintext.length + 16)

  const cipher = session.createCipher(
    { name: "AES_GCM", params: new GraphenePkcs11.AesGcmParams(iv, Buffer.alloc(0), 128) },
    key
  );

  const raw = Buffer.from(cipher.once(plaintext, dec));

  // GCM: last 16 bytes = auth tag
  const ciphertext = raw.subarray(0, raw.length - 16);
  const tag        = raw.subarray(raw.length - 16);
  return { ciphertext, iv, tag };
}

export function decryptAesGcm(
  keyLabel:   string,
  ciphertext: Buffer,
  iv:         Buffer,
  tag:        Buffer
): Buffer {
  const session = getSession();
  const key     = findKey(keyLabel, "secret");
  const payload = Buffer.concat([ciphertext, tag]);
  const dec = Buffer.alloc(payload.length)

  const decipher = session.createDecipher(
    { name: "AES_GCM", params: new GraphenePkcs11.AesGcmParams(iv, Buffer.alloc(0), 128) },
    key
  );

  return Buffer.from(decipher.once(payload, dec));
}