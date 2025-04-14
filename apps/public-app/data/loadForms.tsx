import Form from "@/model/Form";
import formsData from "./dummyForms.json"; // Load the JSON file

export function loadForms() {
  return formsData.map((form) => Form.fromJSON(form)); // Convert JSON into model instances
}
