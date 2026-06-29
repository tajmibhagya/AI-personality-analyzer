type HeroStripProps = {
  userName: string;
};

export function HeroStrip({ userName }: HeroStripProps) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-[34px] leading-tight">Welcome back, <span className="text-accent">{userName}</span></h1>
      <p className="text-muted text-[15px] mt-1.5">Here&apos;s a snapshot of your profile and what&apos;s next.</p>
    </div>
  );
}
