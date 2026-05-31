import * as GraphenePkcs11 from "graphene-pk11";
import { softHsmConfig } from "../../config/softhsm";

const { Module, SessionFlag } = GraphenePkcs11;

let _module:  GraphenePkcs11.Module  | null = null;
let _session: GraphenePkcs11.Session | null = null;

export async function initPkcs11(): Promise<void> {
  if (_session) return;

  _module = Module.load(softHsmConfig.modulePath, "SoftHSM2");
  _module.initialize();

  const slots = _module.getSlots(true);
  if (slots.length === 0) throw new Error("PKCS11: no initialized slots found");

  let slot: GraphenePkcs11.Slot | undefined;
  for (let i = 0; i < slots.length; i++) {
    const s = slots.items(i);
    if (s.getToken().label.trim() === softHsmConfig.tokenLabel.trim()) {
      slot = s;
      break;
    }
  }
  if (!slot) throw new Error(`PKCS11: token "${softHsmConfig.tokenLabel}" not found`);

  _session = slot.open(SessionFlag.RW_SESSION | SessionFlag.SERIAL_SESSION);
  _session.login(softHsmConfig.userPin);

  const token = slot.getToken();
  console.log(`[pkcs11] session open — token="${token.label.trim()}"`);
}

export function getSession(): GraphenePkcs11.Session {
  if (!_session) throw new Error("PKCS11: session not initialized");
  return _session;
}

export async function closePkcs11(): Promise<void> {
  _session?.logout();
  _session?.close();
  _session = null;
  _module?.finalize();
  _module = null;
  console.log("[pkcs11] session closed");
}

export function pkcs11Status(): { ok: boolean; token: string; objects: number } {
  try {
    const session = getSession();
    const objects = session.find({}).length;
    return { ok: true, token: softHsmConfig.tokenLabel, objects };
  } catch(error) {
    return { ok: false, token: softHsmConfig.tokenLabel, objects: 0 };
  }
}