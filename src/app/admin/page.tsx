"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Package, Flag, AlertCircle,
  CheckCircle, XCircle, Eye, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { formatDate } from "@/lib/utils";
import type { ReportWithDetails } from "@/types";

const statusColors: Record<string, string> = {
  PENDING: "yellow", REVIEWED: "blue", RESOLVED: "green", DISMISSED: "gray",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (session && session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, router]);

  const fetchReports = async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    try {
      const res = await fetch(`/api/admin/reports${params}`);
      const json = await res.json();
      if (json.success) setReports(json.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [filter]);

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        toast(`Report ${status.toLowerCase()}`, "success");
        fetchReports();
      } else {
        toast(json.error || "Failed to update report", "error");
      }
    } catch {
      toast("Failed to update report", "error");
    }
  };

  const getReportTarget = (report: ReportWithDetails) => {
    if (report.item) return { type: "Item", name: report.item.title };
    if (report.note) return { type: "Note", name: report.note.title };
    if (report.reportedUser) return { type: "User", name: report.reportedUser.name };
    return { type: "Unknown", name: "Deleted" };
  };

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  // Stats
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === "PENDING").length;
  const resolvedReports = reports.filter((r) => r.status === "RESOLVED").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8 text-blue-600" /> Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">Manage reports and moderate content.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Total Reports", value: totalReports, icon: Flag, color: "text-blue-600 bg-blue-100" },
          { label: "Pending", value: pendingReports, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
          { label: "Resolved", value: resolvedReports, icon: CheckCircle, color: "text-green-600 bg-green-100" },
          { label: "Dismissed", value: totalReports - pendingReports - resolvedReports - reports.filter((r) => r.status === "REVIEWED").length, icon: XCircle, color: "text-gray-600 bg-gray-100" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-3 text-lg font-medium text-gray-700">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">All clear! No reports match your filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const target = getReportTarget(report);
            return (
              <div key={report.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={report.reporter.name} src={report.reporter.avatarUrl || undefined} size="sm" />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{report.reporter.name}</span>
                        <span className="text-gray-500"> reported </span>
                        <span className="font-medium text-gray-900">{target.type}: {target.name}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{report.reason}</p>
                      {report.description && (
                        <p className="mt-1 text-xs text-gray-500 italic">{report.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={statusColors[report.status] as "yellow" | "blue" | "green" | "gray"}>
                      {report.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatDate(report.createdAt)}</span>

                    {report.status === "PENDING" && (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => updateReportStatus(report.id, "RESOLVED")} className="text-xs text-green-600 border-green-200 hover:bg-green-50">
                          Resolve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateReportStatus(report.id, "DISMISSED")} className="text-xs text-gray-500">
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
