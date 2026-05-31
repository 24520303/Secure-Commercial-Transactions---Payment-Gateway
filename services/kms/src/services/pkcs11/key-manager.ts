import * as GraphenePkcs11 from "graphene-pk11";
import { getSession } from "./pkcs11.service";

export type KeyClass = "private" | "public" | "secret";

const CLASS_MAP: Record<KeyClass, number> = {
  private: GraphenePkcs11.ObjectClass.PRIVATE_KEY,
  public:  GraphenePkcs11.ObjectClass.PUBLIC_KEY,
  secret:  GraphenePkcs11.ObjectClass.SECRET_KEY,
};

export function findKey(label: string, keyClass: KeyClass): GraphenePkcs11.Key {
  const session = getSession();
  const found = session.find({ class: CLASS_MAP[keyClass], label });
  if (found.length === 0) {
    throw new Error(`PKCS11: ${keyClass} key "${label}" not found`);
  }
  return found.items(0).toType<GraphenePkcs11.Key>();
}

export function listKeys(): Array<{ label: string; class: string; id: string }> {
  const session = getSession();
  const all = session.find({});
  const result: Array<{ label: string; class: string; id: string }> = [];
  for (let i = 0; i < all.length; i++) {
    const obj = all.items(i);
    const key = obj.toType<GraphenePkcs11.Storage>();
    result.push({
      label: key.label,
      class: obj.class.toString(),
      id:    (obj.getAttribute({
        id: null,
      }).id as Buffer)
      .toString("hex")
    });
  }
  return result;
}