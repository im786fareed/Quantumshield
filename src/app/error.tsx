"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { logError } from "@/lib/errorLogger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, "app-error-boundary");
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8 text-center">
        <div className="inline-block p-4 bg-red-500/20 rounded-2xl mb-6">
          <AlertTriangle className="w-16 h-16 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Something went wrong
        </h1>

        <p className="text-gray-400 mb-6">
          QuantumShield safely caught an error. You can retry or return home.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
