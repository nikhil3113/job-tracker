import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateStatuses } from "@/actions/statuses";
import Navbar from "@/components/Navbar";
import StatusManager from "@/components/StatusManager";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const statuses = await getOrCreateStatuses();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job statuses and customize your workflow.
          </p>
        </div>
        <StatusManager initialStatuses={statuses} />
      </main>
    </div>
  );
}
