import { redirect } from "next/navigation";

// Redirect to PEP register as the default registers page
export default function RegistersPage() {
  redirect("/registers/pep");
}
