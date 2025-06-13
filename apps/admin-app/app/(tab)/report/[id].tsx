import { useLocalSearchParams, useRouter } from "expo-router";
import { useReportStore } from "modules/report";
import { ReportPage } from "ui";

export default function Report() {
  const {
    reports,
    fetchReports
  } = useReportStore();

  if (reports.length == 0){
    fetchReports();
  }

  const { id } = useLocalSearchParams();
  const report = reports.find((r) => r.report_id === id);

  return (
    <ReportPage report={report}/>
  );
}
