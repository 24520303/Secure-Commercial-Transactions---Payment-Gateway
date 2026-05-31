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
exports.findKey = findKey;
exports.listKeys = listKeys;
const GraphenePkcs11 = __importStar(require("graphene-pk11"));
const pkcs11_service_1 = require("./pkcs11.service");
const CLASS_MAP = {
    private: GraphenePkcs11.ObjectClass.PRIVATE_KEY,
    public: GraphenePkcs11.ObjectClass.PUBLIC_KEY,
    secret: GraphenePkcs11.ObjectClass.SECRET_KEY,
};
function findKey(label, keyClass) {
    const session = (0, pkcs11_service_1.getSession)();
    const found = session.find({ class: CLASS_MAP[keyClass], label });
    if (found.length === 0) {
        throw new Error(`PKCS11: ${keyClass} key "${label}" not found`);
    }
    return found.items(0).toType();
}
function listKeys() {
    const session = (0, pkcs11_service_1.getSession)();
    const all = session.find({});
    const result = [];
    for (let i = 0; i < all.length; i++) {
        const obj = all.items(i);
        const key = obj.toType();
        result.push({
            label: key.label,
            class: obj.class.toString(),
            id: obj.getAttribute({
                id: null,
            }).id
                .toString("hex")
        });
    }
    return result;
}
