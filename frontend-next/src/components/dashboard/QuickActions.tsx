import { QuickActionCard } from "./QuickActionCard";

const actions = [
  {
    title: "Take Test",
    subtitle: "Analyze your personality",
    iconPath: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    title: "Upload CV",
    subtitle: "Get AI insights",
    iconPath: "M12 15V4m0 0L8 8m4-4 4 4M5 20h14",
  },
  {
    title: "View Insights",
    subtitle: "Deep dive into your profile",
    iconPath: "M3 3v18h18M7 14l3-3 3 3 5-6",
  },
  {
    title: "Recommendations",
    subtitle: "Personalized for you",
    iconPath: "M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {actions.map((a) => (
        <QuickActionCard key={a.title} {...a} />
      ))}
    </div>
  );
}