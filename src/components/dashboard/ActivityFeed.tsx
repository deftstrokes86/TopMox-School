import { Clock3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActivityItem = {
  title: string;
  time: string;
};

type ActivityFeedProps = {
  title?: string;
  items?: ActivityItem[];
};

const defaultItems: ActivityItem[] = [
  { title: "Phase foundation setup complete", time: "Just now" },
  { title: "Dashboard shell placeholders created", time: "A moment ago" },
  { title: "Theme tokens aligned to design direction", time: "Today" }
];

export function ActivityFeed({
  title = "Recent Activity",
  items = defaultItems
}: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.title}-${item.time}`}
            className="flex items-start gap-2 rounded-lg bg-soft-cream px-3 py-2"
          >
            <Clock3 className="mt-0.5 h-4 w-4 text-royal-blue" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {item.title}
              </p>
              <p className="text-xs text-text-muted">{item.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
