import { Download, FileClock } from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader } from "@/components/ui";
import type { ReportExportJob } from "../types/report.types";

interface ReportExportJobsTableProps {
  jobs: ReportExportJob[];
  loading?: boolean;
  downloading?: boolean;
  onDownload: (job: ReportExportJob) => void;
}

const statusVariantMap: Record<ReportExportJob["status"], "warning" | "success" | "error" | "default"> = {
  queued: "warning",
  processing: "warning",
  completed: "success",
  failed: "error",
  expired: "default",
};

export default function ReportExportJobsTable({
  jobs,
  loading = false,
  downloading = false,
  onDownload,
}: ReportExportJobsTableProps) {
  return (
    <Card>
      <CardHeader title="Recent Export Jobs" subtitle="Latest export queue status" action={<FileClock className="h-4 w-4" />} />
      <CardContent className="mt-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Format</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Rows</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-4 text-text-secondary" colSpan={6}>
                  Loading export jobs...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-text-secondary" colSpan={6}>
                  No export jobs yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-border/70">
                  <td className="px-3 py-2">{job.report_type}</td>
                  <td className="px-3 py-2 uppercase">{job.file_format}</td>
                  <td className="px-3 py-2">
                    <Badge variant={statusVariantMap[job.status]}>{job.status}</Badge>
                  </td>
                  <td className="px-3 py-2">{job.row_count ?? "-"}</td>
                  <td className="px-3 py-2">{new Date(job.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={job.status !== "completed" || !job.artifact_url}
                      loading={downloading}
                      leftIcon={<Download className="h-4 w-4" />}
                      onClick={() => onDownload(job)}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
