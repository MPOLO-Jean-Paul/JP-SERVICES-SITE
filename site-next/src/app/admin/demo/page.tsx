import type { Metadata } from "next";
import { AdminDemo } from "@/components/admin-demo";

export const metadata: Metadata = {
  title: "Aperçu de la console d'administration",
  description: "Aperçu en lecture seule et données fictives du back-office JP-SERVICES.",
  robots: { index: false, follow: false }
};

export default function AdminDemoPage() {
  return <AdminDemo />;
}
