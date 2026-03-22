import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/LandingNavbar";
import {
  ArrowRight,
  Sparkles,
  WandSparkles,
  Brain,
  CalendarClock,
  Hand,
  BarChart3,
  Tags,
  StickyNote,
  Download,
  ArrowDownToLine,
  GitCompare,
  Rocket,
  LayoutDashboard,
  Grip,
  BellRing,
  FileText,
} from "lucide-react";



export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div
      className={` flex min-h-screen flex-col bg-[#fcf9f8] text-[#1c1b1b] dark:bg-[#0f1117] dark:text-[#e9edf7]`}
    >
      <LandingNavbar />

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/20" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-cyan-500/20" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge className="rounded-full border-0 bg-blue-100 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-blue-800 uppercase dark:bg-blue-500/15 dark:text-blue-200">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                New: AI Cover Letter Generator
              </Badge>
              <h1 className="mt-6 text-5xl leading-[1.02] font-extrabold tracking-tight text-[#1c1b1b] sm:text-6xl lg:text-7xl  dark:text-[#e9edf7]">
                Your Career Journey,
                <br />
                <span className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] bg-clip-text text-transparent">
                  Visualized.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#434655]  dark:text-[#a7b0c2]">
                Move beyond messy spreadsheets. Track applications, generate
                AI-powered documents, and run your job search with calm,
                editorial clarity.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-8 text-base font-bold shadow-[0_20px_40px_-20px_rgba(28,27,27,0.18)] hover:-translate-y-0.5"
                >
                  <Link href="/register">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-[#c3c6d7] bg-white px-8 text-base font-semibold dark:border-[#3a4458] dark:bg-[#151a23] dark:text-[#e9edf7]"
                >
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -right-6 h-52 w-52 rounded-full bg-blue-200/40 blur-2xl dark:bg-blue-500/20" />
              <div className="relative rounded-3xl border border-[#e5e2e1] bg-white p-5 shadow-[0_24px_55px_-28px_rgba(28,27,27,0.28)] sm:p-6 dark:border-[#2b3342] dark:bg-[#151a23]">
                <div className="grid h-[420px] grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#f6f3f2] p-3 dark:bg-[#0f1117]">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#737686] uppercase dark:text-[#9ca7bc]">
                      Applied (12)
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border-l-4 border-[#004ac6] bg-white p-3 dark:bg-[#1b2230]">
                        <div className="h-1.5 w-12 rounded-full bg-blue-200 dark:bg-blue-400/60" />
                        <div className="mt-2 h-2.5 w-full rounded bg-[#e5e2e1] dark:bg-[#2f3748]" />
                        <div className="mt-1.5 h-2.5 w-2/3 rounded bg-[#f0eded] dark:bg-[#242c3b]" />
                      </div>
                      <div className="rounded-lg bg-white p-3 opacity-70 dark:bg-[#1b2230] dark:opacity-100">
                        <div className="h-1.5 w-10 rounded-full bg-[#e5e2e1] dark:bg-[#2f3748]" />
                        <div className="mt-2 h-2.5 w-full rounded bg-[#f0eded] dark:bg-[#242c3b]" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f6f3f2] p-3 dark:bg-[#0f1117]">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#737686] uppercase dark:text-[#9ca7bc]">
                      Interview (4)
                    </p>
                    <div className="mt-3 rounded-lg border-l-4 border-[#6a1edb] bg-white p-3 dark:bg-[#1b2230]">
                      <div className="h-1.5 w-12 rounded-full bg-violet-200 dark:bg-violet-400/60" />
                      <div className="mt-2 h-2.5 w-full rounded bg-[#e5e2e1] dark:bg-[#2f3748]" />
                      <div className="mt-1.5 h-2.5 w-2/3 rounded bg-[#f0eded] dark:bg-[#242c3b]" />
                      <div className="mt-2.5 flex gap-1">
                        <div className="h-3 w-3 rounded-full bg-[#c3c6d7] dark:bg-[#445069]" />
                        <div className="h-3 w-3 rounded-full bg-[#d9dbe7] dark:bg-[#586581]" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f6f3f2] p-3 dark:bg-[#0f1117]">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#737686] uppercase dark:text-[#9ca7bc]">
                      Offer (2)
                    </p>
                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-400/40 dark:bg-blue-500/10">
                      <div className="flex items-center justify-between">
                        <div className="h-1.5 w-12 rounded-full bg-blue-300 dark:bg-blue-300/70" />
                        <WandSparkles className="h-3.5 w-3.5 text-[#004ac6]" />
                      </div>
                      <div className="mt-2 h-2.5 w-full rounded bg-blue-200/70 dark:bg-blue-300/30" />
                      <div className="mt-1.5 h-2.5 w-1/2 rounded bg-blue-100 dark:bg-blue-300/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#e5e2e1] bg-[#f6f3f2] px-4 py-24 sm:px-6 lg:px-8 dark:border-[#2b3342] dark:bg-[#121723]">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-14 max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight text-[#1c1b1b]  dark:text-[#e9edf7]">
                Built for Momentum.
              </h2>
              <p className="mt-4 text-lg text-[#434655]  dark:text-[#a7b0c2]">
                Everything you need to move applications to offers with more
                clarity and less friction.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
              <Card className="border-[#e5e2e1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 lg:col-span-2 dark:border-[#2b3342] dark:bg-[#151a23]">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-[#004ac6] dark:bg-blue-500/20 dark:text-blue-200">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <CardTitle className="">
                    Kanban Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#434655]  dark:text-[#a7b0c2]">
                    Visual stage tracking that adapts to your unique process.
                    Drag, drop, and keep momentum from first outreach to final
                    negotiation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#e5e2e1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#2b3342] dark:bg-[#151a23]">
                <CardHeader>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <CardTitle className="">
                    Date Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#434655]  dark:text-[#a7b0c2]">
                    Automatic application age tracking and follow-up reminders
                    so promising leads never go cold.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#e5e2e1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#2b3342] dark:bg-[#151a23]">
                <CardHeader>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-200 text-zinc-700 dark:bg-slate-600/30 dark:text-slate-200">
                    <Grip className="h-5 w-5" />
                  </div>
                  <CardTitle className="">
                    Custom Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#434655]  dark:text-[#a7b0c2]">
                    Create specialized workflows for each search strategy,
                    industry, or role level.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#e5e2e1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 dark:border-[#2b3342] dark:bg-[#151a23]">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
                    <Hand className="h-5 w-5" />
                  </div>
                  <CardTitle className="">
                    Drag-and-Drop Simplicity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#434655]  dark:text-[#a7b0c2]">
                    Effortlessly manage dozens of applications with an interface
                    that feels like an extension of your thought process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-[#fcf9f8] px-4 py-28 sm:px-6 lg:px-8 dark:bg-[#0f1117]">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-violet-700 uppercase dark:text-violet-300">
                Intelligent Career Assistant
              </p>
              <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-[#1c1b1b] sm:text-5xl  dark:text-[#e9edf7]">
                AI that works as hard as you do.
              </h2>
              <div className="mt-10 space-y-8">
                {[
                  {
                    title: "Cover Letter Generator",
                    desc: "Generate tailored letters in seconds that match the role and still sound like you.",
                    icon: FileText,
                  },
                  {
                    title: "Smart Job Analysis",
                    desc: "Get instant signal on hidden keywords, expected stack, and likely interview focus areas.",
                    icon: Brain,
                  },
                  {
                    title: "Success Probability Insights",
                    desc: "Spot where your pipeline slows down and prioritize opportunities with better conversion.",
                    icon: BarChart3,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1c1b1b]  dark:text-[#e9edf7]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[#434655]  dark:text-[#a7b0c2]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -rotate-2 rounded-[2rem] bg-violet-100/60 dark:bg-violet-500/15" />
              <div className="relative rounded-[2rem] border border-[#e5e2e1] bg-white p-8 shadow-[0_20px_45px_-24px_rgba(28,27,27,0.26)] dark:border-[#2b3342] dark:bg-[#151a23]">
                <div className="flex items-center justify-between border-b border-[#e5e2e1] pb-4 dark:border-[#2b3342]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-violet-200/60 dark:bg-violet-400/30" />
                    <p className="font-semibold text-[#1c1b1b]  dark:text-[#e9edf7]">
                      Drafting: Senior Product Designer
                    </p>
                  </div>
                  <span className="text-xs font-semibold tracking-wide text-[#737686] uppercase dark:text-[#9ca7bc]">
                    AI Active
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-3 rounded-full bg-[#f0eded] dark:bg-[#2f3748]" />
                  <div className="h-3 w-5/6 rounded-full bg-[#f0eded] dark:bg-[#2f3748]" />
                  <div className="h-3 rounded-full bg-[#f0eded] dark:bg-[#2f3748]" />
                  <div className="h-3 w-4/6 rounded-full bg-violet-100 dark:bg-violet-400/30" />
                  <div className="h-3 rounded-full bg-[#f0eded] dark:bg-[#2f3748]" />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/40 dark:bg-[#151a23] dark:text-violet-200">
                    Professional Tone
                  </Badge>
                  <Badge className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/40 dark:bg-[#151a23] dark:text-violet-200">
                    Action-Oriented
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f3f2] px-4 py-24 sm:px-6 lg:px-8 dark:bg-[#121723]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Interview Notes",
                desc: "Keep every conversation, prep note, and interviewer detail in one place.",
                icon: StickyNote,
              },
              {
                title: "Smart Tagging",
                desc: "Categorize by stack, salary range, remote status, or referral source.",
                icon: Tags,
              },
              {
                title: "Smart Reminders",
                desc: "Get nudges when follow-up windows open so opportunities stay warm.",
                icon: BellRing,
              },
              {
                title: "CSV Portability",
                desc: "Export your entire search history anytime. Your data is always yours.",
                icon: Download,
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-3">
                <feature.icon className="h-7 w-7 text-[#004ac6] dark:text-blue-300" />
                <h3 className="text-xl font-bold text-[#1c1b1b]  dark:text-[#e9edf7]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#434655]  dark:text-[#a7b0c2]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#fcf9f8] px-4 py-24 sm:px-6 lg:px-8 dark:bg-[#0f1117]">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <h2 className="text-4xl font-extrabold tracking-tight text-[#1c1b1b] sm:text-5xl  dark:text-[#e9edf7]">
                From Apply to Offer.
              </h2>
              <p className="mt-4 text-lg text-[#434655]  dark:text-[#a7b0c2]">
                A simple process to keep your search organized and moving.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Add Applications",
                  desc: "Import jobs from boards or add manually in seconds.",
                  icon: ArrowDownToLine,
                  filled: true,
                },
                {
                  title: "Track Progress",
                  desc: "Move stages, capture notes, and prep for interviews.",
                  icon: GitCompare,
                  filled: false,
                },
                {
                  title: "Land the Offer",
                  desc: "Compare outcomes and choose the right next move.",
                  icon: Rocket,
                  filled: true,
                },
              ].map((step, index) => (
                <Card key={step.title} className="border-[#e5e2e1] bg-white text-center shadow-sm dark:border-[#2b3342] dark:bg-[#151a23]">
                  <CardHeader>
                    <div
                      className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${step.filled
                          ? "bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white"
                          : "bg-[#f0eded] text-[#1c1b1b] dark:bg-[#2f3748] dark:text-[#e9edf7]"
                        }`}
                    >
                      <span className="text-xl font-black ">
                        {index + 1}
                      </span>
                    </div>
                    <CardTitle className="">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#434655]  dark:text-[#a7b0c2]">
                      {step.desc}
                    </p>
                    <step.icon className="mx-auto mt-4 h-5 w-5 text-[#004ac6] dark:text-blue-300" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-6 py-16 text-center text-white sm:px-10 lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl ">
                Ready to organize your career move?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100 ">
                Join thousands of professionals using JobTracker to streamline
                their pipeline and secure better offers faster.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-white px-8 text-base font-bold text-[#004ac6] hover:bg-blue-50 dark:bg-[#ecf2ff]"
                >
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-blue-200/70 bg-blue-700/20 px-8 text-base font-semibold text-white hover:bg-blue-700/30 dark:border-blue-200/40 dark:bg-blue-900/30"
                >
                  <Link href="/demo">View Interactive Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e2e1] bg-[#f6f3f2] py-10 dark:border-[#2b3342] dark:bg-[#121723]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-[#5f5e5e] sm:px-6 lg:flex-row lg:px-8 dark:text-[#a7b0c2]">
          <p className="">
            &copy; {new Date().getFullYear()} JobTracker. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/demo" className="hover:text-[#004ac6] dark:hover:text-blue-300">
              Demo
            </Link>
            <Link href="/login" className="hover:text-[#004ac6] dark:hover:text-blue-300">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-[#004ac6] dark:hover:text-blue-300">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
