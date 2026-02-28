import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getJobs } from "@/actions/jobs";
import { getOrCreateStatuses } from "@/actions/statuses";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Ensure statuses exist (seeds defaults on first visit)
  const statuses = await getOrCreateStatuses();
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <KanbanBoard initialJobs={jobs} statuses={statuses} />
      </main>
    </div>
  );
}
