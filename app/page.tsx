import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/LandingNavbar";
import {
  ArrowRight,
  LayoutDashboard,
  MousePointerClick,
  CalendarCheck,
  CheckCircle2,
  Users,
  Briefcase,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <Badge
                variant="secondary"
                className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium"
              >
                🚀 Version 1.0 is live
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Your Career Journey, <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Visualized.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Stop using messy spreadsheets.                 Track every job application from &quot;Applied&quot; to &quot;Offer&quot; with our intuitive, drag-and-drop Kanban
                board.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link href="/register">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>

            {/* Mockup / Visual */}
            <div className="mt-16 sm:mt-24 relative mx-auto max-w-5xl">
              <div className="rounded-xl border bg-background/50 p-2 shadow-2xl backdrop-blur-sm lg:rounded-2xl lg:p-4">
                <div className="aspect-[16/9] overflow-hidden rounded-lg border bg-muted/20 shadow-sm relative">
                  {/* Abstract Representation of Board */}
                  <div className="absolute inset-0 flex items-start justify-center gap-4 p-8">
                    {[1, 2, 3, 4].map((col) => (
                      <div
                        key={col}
                        className="h-full w-full max-w-[240px] rounded-lg bg-muted/40 p-4 space-y-3"
                      >
                        <div className="h-6 w-24 rounded bg-muted-foreground/20" />
                        <div className="h-24 w-full rounded bg-background shadow-sm border" />
                        <div className="h-24 w-full rounded bg-background shadow-sm border" />
                        {col % 2 === 0 && (
                          <div className="h-24 w-full rounded bg-background shadow-sm border" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Decorative gradients */}
              <div className="absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl opacity-50" />
              <div className="absolute -bottom-24 -right-24 -z-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl opacity-50" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30 border-t border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything you need to land your dream job
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple enough for anyone to use, powerful enough to organize
                hundreds of applications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="bg-background border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <CardTitle>Kanban Workflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize your pipeline. See exactly where each application
                    stands at a glance, from application to offer letter.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-600">
                    <MousePointerClick className="h-6 w-6" />
                  </div>
                  <CardTitle>Drag & Drop</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Effortlessly move jobs between stages. Updates are saved
                    instantly so you never lose track of your progress.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 text-amber-600">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>Date Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Keep a record of when you applied. Never forget when to
                    follow up or how long an application has been stagnant.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Streamline your job search in 3 steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Add Applications</h3>
                <p className="text-muted-foreground">
                  Quickly add new job applications with key details like
                  company, title, and link.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Track Progress</h3>
                <p className="text-muted-foreground">
                  Move cards across columns as you progress through interviews
                  and take home assignments.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Land the Offer</h3>
                <p className="text-muted-foreground">
                  Stay organized and confident until you sign that offer letter.
                  No more lost emails.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-3xl p-8 sm:p-16 text-center text-primary-foreground max-w-5xl mx-auto relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Ready to organize your job search?
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
                  Join thousands of job seekers who have streamlined their
                  application process. Start tracking for free today.
                </p>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 text-base text-primary font-semibold"
                >
                  <Link href="/register">Create Free Account</Link>
                </Button>
              </div>

              {/* Decorative circles */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} JobTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
