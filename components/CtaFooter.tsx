import Link from "next/link";

export function CtaFooter() {
  return (
    <section id="cta" className="relative px-4 pb-10 pt-28 md:px-8 md:pb-12 md:pt-32">
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_36%,rgba(230,0,0,0.12),transparent_24%)]" />

      <div className="relative mx-auto max-w-6xl text-center">
        <h2 className="text-balance text-4xl font-black leading-tight tracking-[0.01em] text-white md:text-6xl md:leading-[1.1]">
          让 AI 真正进入你的工作
        </h2>

        <div className="mt-10 flex justify-center">
          <a
            href="#hero"
            className="relative inline-flex w-full max-w-[20rem] items-center justify-center rounded-2xl bg-claw-red px-8 py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(230,0,0,0.5)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 md:w-auto md:max-w-none"
          >
            <span className="absolute inset-0 rounded-2xl bg-claw-red/45 blur-2xl animate-pulse" />
            <span className="relative">立即体验 HelloClaw</span>
          </a>
        </div>
      </div>

      <footer className="relative mx-auto mt-24 max-w-7xl border-t border-white/5">
        <div className="flex flex-col items-center justify-between gap-6 py-8 text-center md:flex-row md:items-center md:gap-0 md:text-left">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <div className="text-xs text-gray-500">
              Copyright © 2026 HelloClaw. All Rights Reserved.
            </div>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-gray-500 transition-colors hover:text-gray-400 hover:underline hover:underline-offset-4"
            >
              冀ICP备2023012556号-4
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-end">
            <Link
              href="/user-agreement"
              className="text-xs text-gray-500 transition-colors hover:text-white"
            >
              用户协议
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs text-gray-500 transition-colors hover:text-white"
            >
              隐私政策
            </Link>
            <span className="cursor-default text-xs text-gray-500 transition-colors hover:text-white">
              联系我们
            </span>

            <div className="group relative">
              <button
                type="button"
                className="inline-flex items-center text-xs text-white transition-colors hover:text-white/85"
              >
                微信公众号
              </button>

              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-4 -translate-x-1/2 opacity-0 transition duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
                <div className="w-[11rem] min-w-[11rem] rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                  <div className="mb-2 whitespace-nowrap text-center text-[10px] uppercase tracking-[0.2em] text-gray-500">
                    微信扫一扫
                  </div>
                  <img
                    src="/wechat-search-qr-square.png"
                    alt="HelloClaw 微信公众号二维码"
                    width={144}
                    height={144}
                    className="block h-36 w-36 rounded-lg bg-white object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
