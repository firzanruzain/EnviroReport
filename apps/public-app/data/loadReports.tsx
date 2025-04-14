import Report from "@/model/Report"; // Import the Report model
import dummyData from "../data/dummyReports.json"; // Import JSON data

const loadDummyReports = () => {
  return dummyData.map((data) => Report.fromJSON(data)); // Convert JSON objects into Report instances
};

export default loadDummyReports;
