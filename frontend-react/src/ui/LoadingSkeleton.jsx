export default function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm">
      <div className="animate-pulse space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-3 rounded-full bg-slate-200 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}

