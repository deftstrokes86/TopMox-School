import { notFound } from "next/navigation";

import { ParentProgressReportView } from "@/components/reports/ParentProgressReportView";
import { getCurrentParentReportById } from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

type ParentReportDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function ParentReportDetailPage({
  params
}: ParentReportDetailPageProps) {
  const report = await getCurrentParentReportById(params.id);

  if (!report) {
    notFound();
  }

  return <ParentProgressReportView report={report} />;
}
