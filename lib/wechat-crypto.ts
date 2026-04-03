import { createCipheriv, createDecipheriv, createHash } from "crypto";

function decodeEncodingAesKey(encodingAesKey: string) {
  const normalized = encodingAesKey.trim();
  if (!normalized) {
    throw new Error("Missing EncodingAESKey");
  }

  const key = Buffer.from(`${normalized}=`, "base64");
  if (key.length !== 32) {
    throw new Error("Invalid EncodingAESKey");
  }

  return key;
}

function pkcs7Unpad(buffer: Buffer) {
  const pad = buffer[buffer.length - 1];
  if (pad < 1 || pad > 32) {
    throw new Error("Invalid PKCS7 padding");
  }
  for (let i = 0; i < pad; i += 1) {
    if (buffer[buffer.length - 1 - i] !== pad) {
      throw new Error("Corrupted PKCS7 padding");
    }
  }
  return buffer.subarray(0, buffer.length - pad);
}

export function buildWechatCallbackSignature(parts: string[]) {
  return createHash("sha1").update(parts.sort().join("")).digest("hex");
}

export function verifyWechatEncryptedSignature(input: {
  token: string;
  timestamp: string;
  nonce: string;
  encrypted: string;
  msgSignature?: string | null;
}) {
  if (!input.msgSignature) return false;
  const expected = buildWechatCallbackSignature([
    input.token,
    input.timestamp,
    input.nonce,
    input.encrypted,
  ]);
  return expected === input.msgSignature;
}

export function decryptWechatMessage(input: {
  encrypted: string;
  encodingAesKey: string;
  appId?: string | null;
}) {
  const aesKey = decodeEncodingAesKey(input.encodingAesKey);
  const iv = aesKey.subarray(0, 16);
  const decipher = createDecipheriv("aes-256-cbc", aesKey, iv);
  decipher.setAutoPadding(false);

  const encryptedBuffer = Buffer.from(input.encrypted, "base64");
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);
  const unpadded = pkcs7Unpad(decrypted);

  const msgLength = unpadded.readUInt32BE(16);
  const xmlStart = 20;
  const xmlEnd = xmlStart + msgLength;
  const xml = unpadded.subarray(xmlStart, xmlEnd).toString("utf8");
  const appId = unpadded.subarray(xmlEnd).toString("utf8");

  if (input.appId && appId && appId !== input.appId) {
    throw new Error("WeChat AppID mismatch");
  }

  return { xml, appId };
}

function pkcs7Pad(buffer: Buffer, blockSize = 32) {
  const amountToPad = blockSize - (buffer.length % blockSize || blockSize);
  const padBuffer = Buffer.alloc(amountToPad, amountToPad);
  return Buffer.concat([buffer, padBuffer]);
}

export function encryptWechatMessage(input: {
  plainText: string;
  encodingAesKey: string;
  appId: string;
}) {
  const aesKey = decodeEncodingAesKey(input.encodingAesKey);
  const iv = aesKey.subarray(0, 16);
  const random16 = Buffer.from("0123456789abcdef");
  const messageBuffer = Buffer.from(input.plainText, "utf8");
  const appIdBuffer = Buffer.from(input.appId, "utf8");
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(messageBuffer.length, 0);
  const plain = pkcs7Pad(Buffer.concat([random16, lengthBuffer, messageBuffer, appIdBuffer]));

  const cipher = createCipheriv("aes-256-cbc", aesKey, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(plain), cipher.final()]).toString("base64");
}
