import { createTransform } from "redux-persist";
import * as CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "fallback-key";

interface EncryptedState {
  encryptedState: string;
}

export const encryptTransform = createTransform(
  (inboundState, key) => {
    if (key === "auth" || key === "recruiter") {
      return {
        encryptedState: CryptoJS.AES.encrypt(
          JSON.stringify(inboundState),
          ENCRYPTION_KEY
        ).toString(),
      };
    }
    return inboundState;
  },
  (outboundState, key) => {
    if (
      (key === "auth" || key === "recruiter") &&
      typeof outboundState === "object" &&
      outboundState !== null
    ) {
      const encryptedState = (outboundState as EncryptedState).encryptedState;
      if (typeof encryptedState === "string") {
        const decryptedState = CryptoJS.AES.decrypt(
          encryptedState,
          ENCRYPTION_KEY
        ).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedState);
      }
    }
    return outboundState;
  }
);
