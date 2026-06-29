import Link from "next/link";

type QuickActionCardProps = {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  href: string;
};

export function QuickActionCard({ icon, label, subtitle, href }: QuickActionCardProps) {
  return (
    <Link href={href} className="block bg-surface border border-[color:var(--color-border-subtle)] rounded-[16px] p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-accent)]/40 hover:bg-surface-2 group">
      <div className="w-10 h-10 rounded-[10px] bg-accent-soft flex items-center justify-center mb-3 text-accent">{icon}</div>
      <div className="font-display text-[16px] mb-0.5 group-hover:text-accent transition-colors">{label}</div>
      <div className="text-muted text-[12.5px]">{subtitle}</div>
    </Link>
  );
}
