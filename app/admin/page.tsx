import { redirect } from "next/navigation";
import { auth, isAdminSessionEmail } from "../../auth";
import { AdminDashboard } from "../../components/admin-dashboard";
import { getAnalyticsSnapshot } from "../../lib/analytics";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "admin" && !isAdminSessionEmail(session?.user?.email)) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  const analytics = await getAnalyticsSnapshot();

  return (
    <main className="bg-[#050505]">
      <AdminDashboard session={session!} analytics={analytics} />
    </main>
  );
}
