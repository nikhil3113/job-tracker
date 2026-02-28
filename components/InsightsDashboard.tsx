"use client";

import { useState } from "react";
import { Job, Status } from "@prisma/client";
import { generateInsights } from "@/actions/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Brain,
  Briefcase,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

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

  const statusCounts: Record<string, { label: string; count: number }> = {};
  for (const status of statuses) {
    statusCounts[status.id] = {
      label: status.label,
      count: jobs.filter((j) => j.statusId === status.id).length,
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
    <div className="flex flex-col gap-6">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground mt-1">
          Analytics and AI-powered insights for your job search.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Across {uniqueCompanies} {uniqueCompanies === 1 ? "company" : "companies"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsThisWeek}</div>
            <p className="text-xs text-muted-foreground">Applications sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsThisMonth}</div>
            <p className="text-xs text-muted-foreground">Applications sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCompanies}</div>
            <p className="text-xs text-muted-foreground">Unique companies</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pipeline Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {totalJobs === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications yet. Add jobs to see your pipeline.
            </p>
          ) : (
            <div className="space-y-3">
              {statuses.map((status) => {
                const count = statusCounts[status.id]?.count || 0;
                const percentage =
                  totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
                return (
                  <div key={status.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{status.label}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {sortedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.company}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.dateApplied).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            {!loading && (
              <Button
                onClick={handleGenerateInsights}
                variant={aiInsights ? "outline" : "default"}
                size="sm"
              >
                <Brain className="mr-2 h-4 w-4" />
                {aiInsights ? "Regenerate" : "Generate Insights"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Analyzing your job search data...
              </p>
            </div>
          ) : aiInsights ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
              {aiInsights.split("\n").map((line: string, i: number) => {
                if (line.startsWith("## ")) {
                  return (
                    <h3
                      key={i}
                      className="text-base font-semibold mt-4 mb-2 first:mt-0"
                    >
                      {line.replace("## ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <li key={i} className="ml-4 list-disc">
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <Brain className="h-12 w-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No insights generated yet</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Click &quot;Generate Insights&quot; to get AI-powered analysis
                  of your job search strategy, trends, and suggestions.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
