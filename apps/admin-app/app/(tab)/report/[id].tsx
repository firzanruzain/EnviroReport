import { useLocalSearchParams } from "expo-router";
import { ReportPage } from "ui";

export default function Report() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null; // or some error state
  }

  return <ReportPage reportId={id} />;
}
