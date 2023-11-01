import AES from "crypto-js/aes";
import { KeyValueObj } from "@/app/types";
import Utf8 from "crypto-js/enc-utf8";

/**
 * EncryptionService
 */
const EncryptionService = class {
  key: string = "";
  /**
   * Function to encrypt data
   * @param value
   * @returns
   */
  constructor() {
    this.key = process.env.CS_ENCRYPTION_KEY || "";
  }
  encrypt(value: string): string {
    const encrypted = AES.encrypt(value, this.key).toString();
    return encrypted;
  }

  /**
   * Function to decrypt data
   * @param value
   * @returns
   */
  decrypt(value: string): string {
    try {
      const bytes = AES.decrypt(value, this.key);
      const decrypted = bytes.toString(Utf8);
      return decrypted;
    } catch (ex) {
      console.warn("Error decrypting", { value, ex });
      return "";
    }
  }
};

const stringEncryptionKeys = [
  "access_token",
  "refresh_token",
  "organization_uid",
  "user_uid",
  "stack_api_key",
  "location",
  "token_type",
  "authorization_type",
];

export const encryptPayload = (payload: KeyValueObj) => {
  const encryption = new EncryptionService();
  stringEncryptionKeys.forEach((key) => {
    payload[key] = encryption.encrypt(payload[key]);
  });

  return payload;
};

export default EncryptionService;
