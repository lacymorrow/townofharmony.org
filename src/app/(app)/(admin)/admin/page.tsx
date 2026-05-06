import { redirect } from "next/navigation";
import { env } from "@/env";
import { routes } from "@/config/routes";

export default async function AdminPage() {
  if (env.NEXT_PUBLIC_BUILDER_API_KEY) {
    redirect(routes.external.builderCms);
  } else {
    redirect(routes.admin.integrations);
  }
}
