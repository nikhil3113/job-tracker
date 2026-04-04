import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InsightsDashboard from "@/components/InsightsDashboard";
import { getStatuses } from "@/actions/statuses";
import Navbar from "@/components/Navbar";

export default async function InsightsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [jobs, statuses] = await Promise.all([
    prisma.job.findMany({
      where: { userId: session.user.id },
      orderBy: { dateApplied: "desc" },
    }),
    getStatuses(),
  ]);

  return (
    <>
      <Navbar />
      <div className="px-5 md:px-10">
        <InsightsDashboard jobs={jobs} statuses={statuses} />
      </div>
    </>
  );
}
