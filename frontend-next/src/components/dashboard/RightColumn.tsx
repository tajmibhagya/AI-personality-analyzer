import Link from "next/link";
import { DownloadReportButton } from "@/components/pdf/DownloadReportButton";

type Recommendation = {
  title: string;
  reason: string;
  match: "high" | "medium" | "low";
};

type RightColumnProps = {
  streakDays: number;
  recs: Recommendation[];
};

const matchBadge = {
  high: { label: "High match", text: "text-accent", bg: "bg-accent-soft" },
  medium: { label: "Medium match", text: "text-[color:var(--color-match-medium)]", bg: "bg-[rgba(245,158,11,0.14)]" },
  low: { label: "Low match", text: "text-muted", bg: "bg-surface-2" },
};

const icons = [
  <svg key="lead" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z" /></svg>,
  <svg key="bulb" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c1 .8 1.5 2 1.5 3.3M16 14.7A7 7 0 0 0 12 2" /></svg>,
  <svg key="heart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" /></svg>,
];

export function RightColumn({ streakDays, recs }: RightColumnProps) {
  return (
    <div className="space-y-4">
      <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-[15px]">Week's activity</h3>
          <span className="text-accent text-[13px] font-semibold tabular-nums">{streakDays} / 7 days</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={"h-7 rounded-[6px] " + (i < streakDays ? "bg-accent" : "bg-surface-2")} />
          ))}
        </div>
      </div>

      <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-[15px]">Top picks for you</h3>
          <Link href="/recommendations" className="text-accent text-[12.5px] font-semibold hover:underline">See all</Link>
        </div>
        <div className="space-y-2.5">
          {recs.map((rec, i) => {
            const badge = matchBadge[rec.match];
            return (
              <Link key={rec.title} href="/recommendations" className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-[10px] hover:bg-surface-2 transition-colors group">
                <div className="w-9 h-9 rounded-[8px] bg-accent-soft flex items-center justify-center text-accent flex-none">{icons[i % icons.length]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13.5px] text-text group-hover:text-accent transition-colors leading-tight">{rec.title}</div>
                  <div className="text-muted text-[12px] mt-0.5 leading-relaxed">{rec.reason}</div>
                  <span className={"inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[5px] " + badge.text + " " + badge.bg}>{badge.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-accent-soft border border-[color:var(--color-accent)]/30 rounded-[18px] p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-[8px] bg-accent flex items-center justify-center text-[#022]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
          </div>
          <h3 className="font-display text-[16px] text-accent">Get your AI report</h3>
        </div>
        <p className="text-muted text-[12.5px] leading-relaxed mb-3">A complete personality breakdown as a shareable PDF.</p>
        <DownloadReportButton variant="primary" className="w-full justify-center" />
      </div>
    </div>
  );
}
