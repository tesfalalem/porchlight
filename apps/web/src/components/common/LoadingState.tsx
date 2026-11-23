export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 py-16 text-slate-500" role="status">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute h-full w-full animate-ping rounded-full bg-navy-900/20" />
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-navy-950 border-t-accent" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E9E5E0] bg-white shadow-sm">
      <div className="aspect-[16/10] shimmer-bg" />
      <div className="space-y-2 p-2.5 sm:p-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-1/2 rounded shimmer-bg" />
          <div className="h-3 w-1/4 rounded shimmer-bg" />
        </div>
        <div className="h-3.5 w-3/4 rounded shimmer-bg" />
        <div className="h-3 w-full rounded shimmer-bg pt-1" />
        <div className="h-6 w-full rounded shimmer-bg mt-1" />
      </div>
    </div>
  );
}
