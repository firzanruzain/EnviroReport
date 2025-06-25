import { useLocalSearchParams } from "expo-router";
import { ReportPage } from "ui";

export default function Report() {
  const { id } = useLocalSearchParams<{ id: string }>();

  console.log(id);

  if (!id) {
    return null; // or some error state
  }

  return <ReportPage enableOption reportId={id} />;
}
