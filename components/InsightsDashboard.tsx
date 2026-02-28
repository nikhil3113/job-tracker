"use client";

import { useState } from "react";
import { Job, Status } from "@prisma/client";
import { generateInsights } from "@/actions/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Brain,
  Briefcase,
  Building2,
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Activity,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { toast } from "sonner";
import { getColorByName } from "@/lib/status-colors";

interface InsightsDashboardProps {
  jobs: Job[];
  statuses: Status[];
}

export default function InsightsDashboard({
  jobs,
  statuses,
}: InsightsDashboardProps) {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Compute static stats
  const totalJobs = jobs.length;
  const uniqueCompanies = new Set(jobs.map((j) => j.company)).size;

  const statusCounts: Record<
    string,
    { label: string; count: number; color: string }
  > = {};
  for (const status of statuses) {
    statusCounts[status.id] = {
      label: status.label,
      count: jobs.filter((j) => j.statusId === status.id).length,
      color: status.color,
    };
  }

  const sortedJobs = [...jobs].sort(
    (a, b) =>
      new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
  );

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const applicationsThisWeek = jobs.filter(
    (j) => new Date(j.dateApplied) >= thisWeek
  ).length;

  const thisMonth = new Date();
  thisMonth.setDate(thisMonth.getDate() - 30);
  const applicationsThisMonth = jobs.filter(
    (j) => new Date(j.dateApplied) >= thisMonth
  ).length;

  // Stale jobs: no updates in >7 days
  const now = new Date();
  const staleJobs = jobs.filter(
    (j) => differenceInDays(now, new Date(j.updatedAt)) > 7
  );

  // Map job statusId -> status for easy lookup
  const statusMap = new Map(statuses.map((s) => [s.id, s]));

  const handleGenerateInsights = async () => {
    if (totalJobs === 0) {
      toast.error("Add some job applications first to generate insights");
      return;
    }

    setLoading(true);
    try {
      const jobData = jobs.map((j) => ({
        id: j.id,
        company: j.company,
        title: j.title,
        status: j.status,
        dateApplied: j.dateApplied,
        url: j.url,
      }));

      const statusData = statuses.map((s) => ({
        id: s.id,
        name: s.name,
        label: s.label,
      }));

      const result = await generateInsights({
        jobs: jobData,
        statuses: statusData,
      });
      setAiInsights(result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate insights"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground text-sm">
              Analytics and AI-powered insights for your job search
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Briefcase className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across{" "}
              <span className="font-medium text-foreground">
                {uniqueCompanies}
              </span>{" "}
              {uniqueCompanies === 1 ? "company" : "companies"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {applicationsThisWeek}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Applications sent
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {applicationsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Applications sent
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Building2 className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {uniqueCompanies}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique companies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout for Pipeline and Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Breakdown */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Pipeline Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {totalJobs === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No applications yet. Add jobs to see your pipeline.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {statuses.map((status) => {
                  const count = statusCounts[status.id]?.count || 0;
                  const percentage =
                    totalJobs > 0
                      ? Math.round((count / totalJobs) * 100)
                      : 0;
                  const colorConfig = getColorByName(status.color);
                  return (
                    <div key={status.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${colorConfig.dotColor}`}
                          />
                          <span className="text-sm font-medium">
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums">
                            {count}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorConfig.dotColor} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <Separator className="my-2" />

                {/* Summary row */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{totalJobs} applications</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Recent Applications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {sortedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No applications yet.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedJobs.slice(0, 6).map((job) => {
                  const jobStatus = statusMap.get(job.statusId);
                  const colorConfig = jobStatus
                    ? getColorByName(jobStatus.color)
                    : null;
                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {jobStatus && colorConfig && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${colorConfig.color} ${colorConfig.borderColor}`}
                          >
                            {jobStatus.label}
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {format(new Date(job.dateApplied), "MMM d")}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {sortedJobs.length > 6 && (
                  <div className="flex items-center justify-center pt-2">
                    <span className="text-xs text-muted-foreground">
                      +{sortedJobs.length - 6} more applications
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Needs Follow-up */}
      {staleJobs.length > 0 && (
        <Card className="border-amber-200/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Needs Follow-up</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Applications not updated in over a week
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0"
              >
                {staleJobs.length} stale
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {staleJobs
                .sort(
                  (a, b) =>
                    new Date(a.updatedAt).getTime() -
                    new Date(b.updatedAt).getTime()
                )
                .slice(0, 8)
                .map((job) => {
                  const days = differenceInDays(now, new Date(job.updatedAt));
                  const isVeryStale = days > 14;
                  const jobStatus = statusMap.get(job.statusId);
                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-background/80 border border-border/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.company}
                          {jobStatus && (
                            <span className="ml-1.5 opacity-60">
                              &middot; {jobStatus.label}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Clock
                          className={`h-3 w-3 ${isVeryStale ? "text-red-500" : "text-amber-500"}`}
                        />
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            isVeryStale ? "text-red-500" : "text-amber-500"
                          }`}
                        >
                          {days}d
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            {staleJobs.length > 8 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                ...and {staleJobs.length - 8} more
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card className="relative overflow-hidden">
        {/* Decorative gradient top border */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">AI Insights</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>
            {!loading && (
              <Button
                onClick={handleGenerateInsights}
                variant={aiInsights ? "outline" : "default"}
                size="sm"
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                {aiInsights ? "Regenerate" : "Generate Insights"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Analyzing your data...</p>
                <p className="text-xs text-muted-foreground">
                  This may take a few seconds
                </p>
              </div>
            </div>
          ) : aiInsights ? (
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                {aiInsights.split("\n").map((line: string, i: number) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h3
                        key={i}
                        className="text-sm font-semibold mt-4 mb-2 first:mt-0 flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                        {line.replace("## ", "")}
                      </h3>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={i} className="ml-4 list-disc marker:text-primary/50">
                        {line.replace("- ", "")}
                      </li>
                    );
                  }
                  if (line.trim() === "") {
                    return <br key={i} />;
                  }
                  return (
                    <p key={i} className="mb-1">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-primary/5" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-7 w-7 text-primary/40" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="text-sm font-medium">No insights generated yet</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get AI-powered analysis of your job search strategy,
                  application trends, and personalized suggestions to improve
                  your results.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
