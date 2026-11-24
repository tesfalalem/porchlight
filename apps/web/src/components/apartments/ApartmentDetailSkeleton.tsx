import { ChevronRight, Home, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApartmentDetailSkeletonProps {
  backTo?: string;
  backLabel?: string;
}

export function ApartmentDetailSkeleton({
  backTo = '/apartments',
  backLabel = 'All Residences',
}: ApartmentDetailSkeletonProps) {
  return (
    <div className="bg-[#FAF8F5] pb-16 min-h-screen animate-pulse">
      {/* ── Breadcrumb Skeleton ── */}
      <div className="border-b border-[#E9E5E0] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-slate-400">
            <Link to="/" className="flex items-center gap-1 hover:text-navy-950">
              <Home className="h-3 w-3" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <Link to={backTo} className="hover:text-navy-950">{backLabel}</Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <div className="h-3 w-20 rounded bg-[#E9E5E0] shimmer-bg" />
          </nav>
        </div>
      </div>

      {/* ── Gallery Skeleton ── */}
      <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[380px] sm:max-h-[440px] w-full overflow-hidden rounded-2xl border border-[#E9E5E0] bg-[#EFECE8] shimmer-bg flex flex-col items-center justify-center text-slate-300 shadow-xs">
          <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 stroke-[1.2] opacity-50" />
          <span className="mt-2 text-xs font-medium text-slate-400">Loading photographs…</span>
        </div>

        {/* Thumbnail Row Skeletons */}
        <div className="mt-3 flex gap-2 overflow-hidden pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-16 sm:h-14 sm:w-20 shrink-0 rounded-xl border border-[#E9E5E0] bg-[#EFECE8] shimmer-bg"
            />
          ))}
        </div>
      </div>

      {/* ── Body Skeletons ── */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-8 sm:space-y-10">

          {/* 1. Header & Identity */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="h-6 w-28 rounded-full bg-[#E9E5E0] shimmer-bg" />
              <div className="flex gap-2">
                <div className="h-7 w-16 rounded-lg bg-[#E9E5E0] shimmer-bg" />
                <div className="h-7 w-16 rounded-lg bg-[#E9E5E0] shimmer-bg" />
              </div>
            </div>

            <div>
              <div className="h-9 w-64 sm:w-80 rounded-lg bg-[#E9E5E0] shimmer-bg" />
              <div className="mt-3 flex gap-2">
                <div className="h-6 w-24 rounded-md bg-[#E9E5E0] shimmer-bg" />
                <div className="h-6 w-20 rounded-md bg-[#E9E5E0] shimmer-bg" />
                <div className="h-6 w-32 rounded-md bg-[#E9E5E0] shimmer-bg" />
              </div>
            </div>

            {/* Price Card Skeleton */}
            <div className="rounded-2xl border border-[#E9E5E0] bg-white p-5 sm:p-6 shadow-xs">
              <div className="h-3 w-24 rounded bg-[#E9E5E0] shimmer-bg" />
              <div className="mt-2.5 h-8 w-48 rounded bg-[#E9E5E0] shimmer-bg" />
              <div className="mt-2 h-3.5 w-60 rounded bg-[#E9E5E0] shimmer-bg" />
            </div>
          </div>

          {/* 2. Key Stats Tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-[#E9E5E0] bg-white p-4 sm:p-5 text-center shadow-2xs">
                <div className="mx-auto h-10 w-10 rounded-xl bg-[#EFECE8] shimmer-bg" />
                <div className="mx-auto mt-3 h-6 w-12 rounded bg-[#E9E5E0] shimmer-bg" />
                <div className="mx-auto mt-1.5 h-3 w-16 rounded bg-[#E9E5E0] shimmer-bg" />
              </div>
            ))}
          </div>

          {/* 3. About Section Skeleton */}
          <div className="rounded-2xl border border-[#E9E5E0] bg-white p-6 sm:p-8 shadow-xs space-y-3">
            <div className="h-5 w-44 rounded bg-[#E9E5E0] shimmer-bg" />
            <div className="h-3.5 w-full rounded bg-[#E9E5E0] shimmer-bg" />
            <div className="h-3.5 w-5/6 rounded bg-[#E9E5E0] shimmer-bg" />
            <div className="h-3.5 w-3/4 rounded bg-[#E9E5E0] shimmer-bg" />
          </div>

        </div>
      </div>
    </div>
  );
}
