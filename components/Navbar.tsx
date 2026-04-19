import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="text-xl font-black tracking-[0.22em] text-white md:text-2xl">
            HELLO
            <span className="text-claw-red">CLAW</span>
          </span>
        </Link>

        <div className="cursor-default rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 transition-colors hover:bg-white/[0.05]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-gray-500">
              GATEWAY ONLINE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
