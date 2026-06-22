import Link from "next/link";

export function BrandBlock({
  name = "MindProfile AI",
  href = "/",
}: {
  name?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 flex-none group"
    >
      {/* Logo mark */}
      <div
        className="w-[38px] h-[38px] rounded-[11px] bg-accent flex items-center justify-center flex-none transition-transform group-hover:scale-105"
        style={{ boxShadow: "0 4px 14px var(--color-accent-soft)" }}
        aria-hidden
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.8 5.6L20 9l-5 3.6L17 19l-5-3.4L7 19l1.8-6.4L4 9l5.6-.4Z" />
        </svg>
      </div>

      {/* Wordmark */}
      <span className="font-display text-[18px] tracking-[-0.02em] whitespace-nowrap">
        {name}
      </span>
    </Link>
  );
}