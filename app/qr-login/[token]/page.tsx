import QrLoginTokenPageClient from "./QrLoginTokenPageClient";

export default async function QrLoginTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <QrLoginTokenPageClient token={token} />;
}
