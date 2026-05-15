"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type ReportPrintButtonProps = {
  label?: string;
};

export function ReportPrintButton({
  label = "Print Report"
}: ReportPrintButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full sm:w-auto print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
