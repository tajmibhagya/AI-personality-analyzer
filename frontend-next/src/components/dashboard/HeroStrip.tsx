export function HeroStrip({ userName }: { userName: string }) {
    return (
      <div className="flex items-end justify-between gap-5 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-[34px] leading-tight">
            Welcome back, <span className="text-accent">{userName}</span>
          </h1>
          <p className="text-muted text-[15px] mt-1.5">
            Here&apos;s a snapshot of your profile and what&apos;s next.
          </p>
        </div>
  
        <div className="flex items-center gap-2 text-muted text-[13px] bg-surface border border-[color:var(--color-border-subtle)] px-3.5 py-2 rounded-[11px]">
          <span className="w-2 h-2 rounded-full bg-accent" />
          Last updated 2 hours ago
        </div>
      </div>
    );
  }