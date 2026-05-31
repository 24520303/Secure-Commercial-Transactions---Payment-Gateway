"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPkcs11 = initPkcs11;
exports.getSession = getSession;
exports.closePkcs11 = closePkcs11;
exports.pkcs11Status = pkcs11Status;
const GraphenePkcs11 = __importStar(require("graphene-pk11"));
const softhsm_1 = require("../../config/softhsm");
const { Module, SessionFlag } = GraphenePkcs11;
let _module = null;
let _session = null;
async function initPkcs11() {
    if (_session)
        return;
    _module = Module.load(softhsm_1.softHsmConfig.modulePath, "SoftHSM2");
    _module.initialize();
    const slots = _module.getSlots(true);
    if (slots.length === 0)
        throw new Error("PKCS11: no initialized slots found");
    let slot;
    for (let i = 0; i < slots.length; i++) {
        const s = slots.items(i);
        if (s.getToken().label.trim() === softhsm_1.softHsmConfig.tokenLabel.trim()) {
            slot = s;
            break;
        }
    }
    if (!slot)
        throw new Error(`PKCS11: token "${softhsm_1.softHsmConfig.tokenLabel}" not found`);
    _session = slot.open(SessionFlag.RW_SESSION | SessionFlag.SERIAL_SESSION);
    _session.login(softhsm_1.softHsmConfig.userPin);
    const token = slot.getToken();
    console.log(`[pkcs11] session open — token="${token.label.trim()}"`);
}
function getSession() {
    if (!_session)
        throw new Error("PKCS11: session not initialized");
    return _session;
}
async function closePkcs11() {
    _session?.logout();
    _session?.close();
    _session = null;
    _module?.finalize();
    _module = null;
    console.log("[pkcs11] session closed");
}
function pkcs11Status() {
    try {
        const session = getSession();
        const objects = session.find({}).length;
        return { ok: true, token: softhsm_1.softHsmConfig.tokenLabel, objects };
    }
    catch {
        return { ok: false, token: softhsm_1.softHsmConfig.tokenLabel, objects: 0 };
    }
}
