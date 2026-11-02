import { redirect } from "next/navigation";

// /Admin sozinho leva ao Dashboard
export default function AdminInicio() {
    redirect("/Admin/DashboardAdmin");
}
