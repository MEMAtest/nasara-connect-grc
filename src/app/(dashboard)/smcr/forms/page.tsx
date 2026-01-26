import { FormGuideClient } from "./FormGuideClient";

export const metadata = {
  title: "FCA Forms Guide | SM&CR",
  description: "Interactive guide to help you identify which FCA forms you need for SM&CR compliance",
};

export default function FormsPage() {
  return <FormGuideClient />;
}
