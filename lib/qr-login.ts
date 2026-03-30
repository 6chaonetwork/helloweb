export function buildQrLoginUrl(qrToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
  return `${baseUrl}/qr-login/${qrToken}`;
}

export function getChallengeTtlSeconds() {
  const raw = Number(process.env.QR_LOGIN_CHALLENGE_TTL_SECONDS || 300);
  if (!Number.isFinite(raw) || raw <= 0) return 300;
  return raw;
}

export function getChallengeExpireSeconds(ttlSeconds: number) {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) return 300;
  return Math.max(60, Math.min(2_592_000, Math.floor(ttlSeconds)));
}
