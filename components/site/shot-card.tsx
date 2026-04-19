import Image from "next/image";
import { cn } from "@/lib/utils";

type ShotCardProps = {
  src: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  imageClassName?: string;
  compact?: boolean;
};

export function ShotCard({
  src,
  alt,
  eyebrow,
  title,
  description,
  className,
  imageClassName,
  compact = false,
}: ShotCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.06)]",
        className,
      )}
    >
      <div className="border-b border-black/8 bg-[#111827] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
          {title ? (
            <span className="ml-3 text-sm font-medium text-white/80">{title}</span>
          ) : null}
        </div>
      </div>
      <div className="bg-[#0b1220] p-3">
        <div className="overflow-hidden rounded-[20px] border border-white/8">
          <Image
            src={src}
            alt={alt}
            width={1440}
            height={900}
            className={cn("h-auto w-full object-cover", imageClassName)}
          />
        </div>
      </div>
      {(eyebrow || description) && !compact ? (
        <div className="px-5 pb-5 pt-1">
          {eyebrow ? (
            <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
              {eyebrow}
            </div>
          ) : null}
          {description ? (
            <p className="mt-3 text-sm leading-7 text-[#4b5563]">{description}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
