import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HelloClaw | AI Agent Desktop Workspace & Control Center",
    template: "%s | HelloClaw",
  },
  description:
    "HelloClaw 把 AI Agent 桌面工作区、多渠道接入、自动化任务和运营控制台整合成一套正式产品体验。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-screen bg-dark-base font-sans text-gray-200 antialiased">
        <Script
          defer
          src="https://stats.helloclaw.top/script.js"
          data-website-id="93d1ed5a-95d8-470e-9654-9ce1159931aa"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
