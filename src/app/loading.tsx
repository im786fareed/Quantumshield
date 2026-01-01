export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse text-center">
        <div className="text-xl font-semibold mb-2">Loading QuantumShield…</div>
        <div className="text-sm text-gray-400">
          Preparing secure environment
        </div>
      </div>
    </div>
  );
}
