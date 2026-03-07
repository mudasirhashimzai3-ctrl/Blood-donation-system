import { useReportsUiStore } from "../stores/useReportsUiStore";

export const useReportTabs = () => {
  const activeTab = useReportsUiStore((state) => state.activeTab);
  const setActiveTab = useReportsUiStore((state) => state.setActiveTab);

  return {
    activeTab,
    setActiveTab,
  };
};
