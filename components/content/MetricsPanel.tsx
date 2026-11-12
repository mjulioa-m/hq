"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { monthLabel } from "@/lib/dates";
import { formatNumber } from "@/lib/money";
import { apiSend } from "@/lib/client-api";

export function MetricsChart({
  months,
  rows,
}: {
  months: string[];
  rows: { ym: string; n: number; views: number }[];
}) {
  const max = Math.max(1, ...months.map((ym) => rows.find((r) => r.ym === ym)?.n ?? 0));
  return (
    <svg viewBox={`0 0 ${months.length * 48} 140`} className="h-40 w-full">
      {months.map((ym, i) => {
        const n = rows.find((r) => r.ym === ym)?.n ?? 0;
        const h = (n / max) * 100;
        return (
          <g key={ym}>
            <rect x={i * 48 + 14} y={110 - h} width={18} height={h} rx={4} fill="#f0c7a6" />
            <text x={i * 48 + 23} y={128} textAnchor="middle" fill="rgba(246,239,232,0.55)" fontSize="10">
              {monthLabel(ym)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MetricsEditor({
  piece,
}: {
  piece: {
    id: string;
    title: string;
    metrics: { views?: number; likes?: number; comments?: number; shares?: number; saves?: number };
  };
}) {
  const router = useRouter();
  const [views, setViews] = useState(String(piece.metrics.views ?? ""));
  const [likes, setLikes] = useState(String(piece.metrics.likes ?? ""));
  const [comments, setComments] = useState(String(piece.metrics.comments ?? ""));
  async function save() {
    await apiSend(`/api/content/pieces/${piece.id}`, "PATCH", {
      metrics: {
        views: Number(views || 0),
        likes: Number(likes || 0),
        comments: Number(comments || 0),
        shares: piece.metrics.shares ?? 0,
        saves: piece.metrics.saves ?? 0,
      },
    });
    router.refresh();
  }
  return (
    <tr className="border-t border-white/10 text-sm">
      <td className="px-3 py-2">{piece.title}</td>
      <td className="px-2">
        <input value={views} onChange={(e) => setViews(e.target.value)} className="h-8 w-24 rounded-lg bg-white/5 px-2" />
      </td>
      <td className="px-2">
        <input value={likes} onChange={(e) => setLikes(e.target.value)} className="h-8 w-20 rounded-lg bg-white/5 px-2" />
      </td>
      <td className="px-2">
        <input value={comments} onChange={(e) => setComments(e.target.value)} className="h-8 w-20 rounded-lg bg-white/5 px-2" />
      </td>
      <td className="px-2 text-ink-3">{formatNumber(piece.metrics.views)}</td>
      <td className="px-2">
        <button type="button" onClick={() => void save()} className="text-accent">
          Guardar
        </button>
      </td>
    </tr>
  );
}
