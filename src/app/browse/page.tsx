"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import type { ItemWithSeller } from "@/types";

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<ItemWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [condition, setCondition] = useState(searchParams.get("condition") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [courseCode, setCourseCode] = useState(searchParams.get("courseCode") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  const debouncedSearch = useDebounce(search, 400);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (courseCode) params.set("courseCode", courseCode);
    params.set("page", String(page));
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.status === 401) {
        // Silent return for guests browsing
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setTotal(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, condition, priceMin, priceMax, courseCode, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (courseCode) params.set("courseCode", courseCode);
    if (page > 1) params.set("page", String(page));
    const queryStr = params.toString();
    router.replace(`/browse${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  }, [debouncedSearch, category, condition, priceMin, priceMax, courseCode, page, router]);

  const clearFilters = () => {
    setSearch(""); setCategory(""); setCondition("");
    setPriceMin(""); setPriceMax(""); setCourseCode(""); setPage(1);
  };

  const hasFilters = category || condition || priceMin || priceMax || courseCode;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
        <p className="mt-2 text-gray-600">Find textbooks, electronics, dorm gear, and more from verified students.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search items..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="gap-2 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear All</button>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</label>
              <div className="mt-2 space-y-1">
                {CATEGORIES.map((c) => (
                  <label key={c.value} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="category"
                      checked={category === c.value}
                      onChange={() => { setCategory(category === c.value ? "" : c.value); setPage(1); }}
                      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{c.icon} {c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</label>
              <div className="mt-2 space-y-1">
                {CONDITIONS.map((c) => (
                  <label key={c.value} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === c.value}
                      onChange={() => { setCondition(condition === c.value ? "" : c.value); setPage(1); }}
                      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number" min={0} placeholder="Min"
                  value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <input
                  type="number" min={0} placeholder="Max"
                  value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Course Code */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</label>
              <input
                type="text" placeholder="e.g. CS101"
                value={courseCode} onChange={(e) => { setCourseCode(e.target.value); setPage(1); }}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </aside>

        {/* Items Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="No Items Found"
              description="Try adjusting your filters or search terms."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{items.length}</span> of{" "}
                  <span className="font-medium text-gray-700">{total}</span> results
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-10 w-64" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}
