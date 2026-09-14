"use client";

import { useCallback, useEffect, useRef } from "react";
import SignaturePadLib from "signature_pad";

export function SignaturePad({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas || !pad) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);
    pad.clear();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePadLib(canvas, { minWidth: 1, maxWidth: 2.5, penColor: "black" });
    padRef.current = pad;
    resizeCanvas();

    const emit = () => onChange(pad.isEmpty() ? null : pad.toDataURL("image/png"));
    pad.addEventListener("endStroke", emit);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      pad.removeEventListener("endStroke", emit);
      window.removeEventListener("resize", resizeCanvas);
      pad.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border-2 border-gray-300 bg-white">
        <canvas ref={canvasRef} className="h-40 w-full touch-none" />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            padRef.current?.clear();
            onChange(null);
          }}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Clear
        </button>
        {value ? (
          <span className="text-xs text-green-700">Signature captured</span>
        ) : (
          <span className="text-xs text-gray-400">Sign above</span>
        )}
      </div>
    </div>
  );
}
