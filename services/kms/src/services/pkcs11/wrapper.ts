import * as GraphenePkcs11 from "graphene-pk11";
import { getSession } from "./pkcs11.service";
import { findKey } from "./key-manager";

export function wrapKey(targetLabel: string, kekLabel: string): Buffer {
  const session   = getSession();
  const kek       = findKey(kekLabel, "secret");
  const targetKey = findKey(targetLabel, "private");
  const mechanism = GraphenePkcs11.MechanismEnum.AES_KEY_WRAP_PAD
  const wrapped   = session.wrapKey(mechanism, kek, targetKey);
  return Buffer.from(wrapped);
}

export function unwrapKey(
  wrappedKey:  Buffer,
  kekLabel:    string,
  newLabel:    string,
  keyType:     "AES" | "EC" = "AES",
  keyLength:   number = 32
): GraphenePkcs11.Key {
  const session = getSession();
  const kek     = findKey(kekLabel, "secret");
  const mechanism = GraphenePkcs11.MechanismEnum.AES_KEY_WRAP_PAD
  return session.unwrapKey(
    mechanism,
    kek,
    wrappedKey,
    {
      class:     keyType === "AES"
                   ? GraphenePkcs11.ObjectClass.SECRET_KEY
                   : GraphenePkcs11.ObjectClass.PRIVATE_KEY,
      keyType:   keyType === "AES"
                   ? GraphenePkcs11.KeyType.AES
                   : GraphenePkcs11.KeyType.EC,
      label:     newLabel,
      token:     false,
      sensitive: true,
      extractable: false,
      valueLen:  keyType === "AES" ? keyLength : undefined,
    }
  );
}