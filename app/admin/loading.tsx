export default function AdminLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" />
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      </div>
    </div>
  );
}
