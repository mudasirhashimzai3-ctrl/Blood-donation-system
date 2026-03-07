import { useCreateReportExport, useDownloadReportExport, useExportJobs } from "../queries/useReportQueries";

export const useReportExport = (enabled: boolean) => {
  const createExport = useCreateReportExport();
  const downloadExport = useDownloadReportExport();
  const jobs = useExportJobs({ page: 1, page_size: 10 }, { enabled });

  return {
    createExport,
    downloadExport,
    jobs,
  };
};
