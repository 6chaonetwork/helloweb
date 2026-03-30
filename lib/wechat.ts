type WechatAccessTokenResponse = {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
};

type WechatQrcodeResponse = {
  ticket?: string;
  expire_seconds?: number;
  url?: string;
  errcode?: number;
  errmsg?: string;
};

type ChannelConfigLike = {
  appId?: string | null;
  appSecretEncrypted?: string | null;
  enabled?: boolean | null;
};

type CachedAccessToken = {
  token: string;
  expiresAt: number;
};

const TOKEN_REFRESH_BUFFER_MS = 60_000;

const globalForWechat = globalThis as typeof globalThis & {
  __wechatAccessTokenCache?: Map<string, CachedAccessToken>;
};

function getAccessTokenCache() {
  if (!globalForWechat.__wechatAccessTokenCache) {
    globalForWechat.__wechatAccessTokenCache = new Map<string, CachedAccessToken>();
  }

  return globalForWechat.__wechatAccessTokenCache;
}

function getWechatApiBaseUrl() {
  return process.env.WECHAT_API_BASE_URL || "https://api.weixin.qq.com";
}

function getRequiredCredential(config: ChannelConfigLike) {
  const appId = config.appId?.trim();
  const appSecret = config.appSecretEncrypted?.trim();

  if (!appId) {
    throw new Error("Missing WeChat AppID");
  }

  if (!appSecret) {
    throw new Error("Missing WeChat AppSecret");
  }

  return { appId, appSecret };
}

async function fetchWechatJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`WeChat API request failed (${response.status}): ${text || response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getWechatAccessToken(config: ChannelConfigLike) {
  const { appId, appSecret } = getRequiredCredential(config);
  const cacheKey = `${appId}:${appSecret}`;
  const cache = getAccessTokenCache();
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt - TOKEN_REFRESH_BUFFER_MS > now) {
    return cached.token;
  }

  const url = new URL("/cgi-bin/token", getWechatApiBaseUrl());
  url.searchParams.set("grant_type", "client_credential");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", appSecret);

  const data = await fetchWechatJson<WechatAccessTokenResponse>(url.toString());

  if (!data.access_token) {
    throw new Error(`Failed to get WeChat access token: ${data.errcode || "unknown"} ${data.errmsg || ""}`.trim());
  }

  const expiresIn = typeof data.expires_in === "number" && data.expires_in > 0 ? data.expires_in : 7200;
  cache.set(cacheKey, {
    token: data.access_token,
    expiresAt: now + expiresIn * 1000,
  });

  return data.access_token;
}

export async function createWechatParamQrCode(input: {
  accessToken: string;
  eventKey: string;
  expireSeconds: number;
}) {
  const url = new URL("/cgi-bin/qrcode/create", getWechatApiBaseUrl());
  url.searchParams.set("access_token", input.accessToken);

  const expireSeconds = Math.max(60, Math.min(2_592_000, Math.floor(input.expireSeconds)));

  const data = await fetchWechatJson<WechatQrcodeResponse>(url.toString(), {
    method: "POST",
    body: JSON.stringify({
      expire_seconds: expireSeconds,
      action_name: "QR_STR_SCENE",
      action_info: {
        scene: {
          scene_str: input.eventKey,
        },
      },
    }),
  });

  if (!data.ticket) {
    throw new Error(`Failed to create WeChat QR code: ${data.errcode || "unknown"} ${data.errmsg || ""}`.trim());
  }

  return {
    ticket: data.ticket,
    url: data.url || null,
    expireSeconds: data.expire_seconds || expireSeconds,
    qrUrl: `${getWechatApiBaseUrl()}/cgi-bin/showqrcode?ticket=${encodeURIComponent(data.ticket)}`,
  };
}
