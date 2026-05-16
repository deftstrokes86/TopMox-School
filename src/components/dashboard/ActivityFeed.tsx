import Link from "next/link";
import {
  Bell,
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileText,
  Headphones,
  MessageSquareText
} from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityCategory, ActivityFeedItem } from "@/lib/utils/activity-feed";

const categoryLabels: Record<ActivityCategory, string> = {
  assessment: "Assessment",
  payment: "Payment",
  lesson: "Lesson",
  homework: "Homework",
  report: "Report",
  support: "Support",
  communication: "Communication",
  notification: "Notification"
};

function formatActivityDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function ActivityIcon({ category }: { category: ActivityCategory }) {
  const className = "h-4 w-4 text-royal-blue";

  switch (category) {
    case "assessment":
      return <ClipboardList className={className} />;
    case "payment":
      return <CreditCard className={className} />;
    case "lesson":
      return <CalendarClock className={className} />;
    case "homework":
      return <BookOpenCheck className={className} />;
    case "report":
      return <FileText className={className} />;
    case "support":
      return <Headphones className={className} />;
    case "communication":
      return <MessageSquareText className={className} />;
    case "notification":
      return <Bell className={className} />;
  }
}

type ActivityFeedProps = {
  title?: string;
  description?: string;
  items: ActivityFeedItem[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ActivityFeed({
  title = "Recent Activity",
  description = "A calm trail of what changed recently across your TopMox workspace.",
  items,
  emptyTitle = "No recent activity yet",
  emptyDescription = "Updates will appear here after assessments, payments, lessons, homework, reports, or support records change."
}: ActivityFeedProps) {
  return (
    <Card className="border-royal-blue/20 shadow-soft">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-deep-navy">{title}</CardTitle>
        {description ? (
          <p className="text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => {
              const content = (
                <div className="flex gap-3 rounded-xl border border-border/80 bg-soft-cream/35 p-4 transition hover:border-royal-blue/30 hover:bg-white">
                  <div className="mt-0.5 shrink-0 rounded-full bg-white p-2 shadow-sm">
                    <ActivityIcon category={item.category} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="break-words font-semibold text-deep-navy">
                          {item.title}
                        </p>
                        <p className="mt-1 break-words text-sm leading-6 text-text-secondary">
                          {item.description}
                        </p>
                      </div>
                      <StatusBadge
                        label={categoryLabels[item.category]}
                        tone={item.tone ?? "neutral"}
                        className="w-fit shrink-0"
                      />
                    </div>
                    <p className="mt-2 text-xs text-text-muted">
                      {formatActivityDate(item.timestamp)}
                    </p>
                  </div>
                </div>
              );

              return item.href ? (
                <Link key={item.id} href={item.href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-6">
            <p className="font-semibold text-deep-navy">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {emptyDescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
