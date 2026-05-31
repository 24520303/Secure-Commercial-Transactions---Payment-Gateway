import crypto from "crypto";
import * as GraphenePkcs11 from "graphene-pk11";
import { getSession } from "./pkcs11.service";
import { findKey } from "./key-manager";

export function signEcdsa(keyLabel: string, data: Buffer): Buffer {
  const session  = getSession();
  const privKey  = findKey(keyLabel, "private");

  const digest = crypto
    .createHash("sha256")
    .update(data)
    .digest();

  const sign = session.createSign(GraphenePkcs11.MechanismEnum.ECDSA, privKey); 

  return Buffer.from(sign.once(digest));
}

export function verifyEcdsa(keyLabel: string, data: Buffer, signature: Buffer): boolean {
  const session = getSession();
  const pubKey  = findKey(keyLabel, "public");

  const digest = crypto
    .createHash("sha256")
    .update(data)
    .digest();

  const verify  = session.createVerify(GraphenePkcs11.MechanismEnum.ECDSA, pubKey);
  
  return verify.once(digest, signature);
}