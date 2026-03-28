import { useEffect, useRef } from "react";
import {
  CompetencyCategory,
  EvalMaterialItem,
  GRADE_LEVEL_COLORS,
  EVAL_COMPETENCY_LABELS,
  EVAL_COMPETENCY_COLORS,
} from "@/types/evaluation.type";


// ==================== 레이더 차트 (Canvas) ====================

export function RadarChart({
  scores,
  labels,
  maxScore = 35,
  size = 280,
}: {
  scores: Record<string, number>;
  labels?: Record<string, string>;
  maxScore?: number;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;
    const categories = Object.keys(scores);
    if (categories.length === 0) return;

    // 배경 그리드
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 12);
    ctx.fill();

    for (let level = 1; level <= 5; level++) {
      const lr = (r * level) / 5;
      ctx.beginPath();
      categories.forEach((_, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
        const x = cx + Math.cos(angle) * lr;
        const y = cy + Math.sin(angle) * lr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 축 라벨
    categories.forEach((cat, i) => {
      const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
      const lx = cx + Math.cos(angle) * (r + 25);
      const ly = cy + Math.sin(angle) * (r + 25);
      
      const color = EVAL_COMPETENCY_COLORS[cat as CompetencyCategory] || "#8b5cf6";
      const labelText = labels?.[cat] || EVAL_COMPETENCY_LABELS[cat as CompetencyCategory] || cat;
      
      ctx.fillStyle = color;
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, lx, ly - 6);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${scores[cat] || 0}점`, lx, ly + 8);
    });

    // 데이터 영역
    ctx.beginPath();
    categories.forEach((cat, i) => {
      const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
      const val = Math.min((scores[cat] || 0) / maxScore, 1);
      const x = cx + Math.cos(angle) * r * val;
      const y = cy + Math.sin(angle) * r * val;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 데이터 포인트
    categories.forEach((cat, i) => {
      const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
      const val = Math.min((scores[cat] || 0) / maxScore, 1);
      const x = cx + Math.cos(angle) * r * val;
      const y = cy + Math.sin(angle) * r * val;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = EVAL_COMPETENCY_COLORS[cat as CompetencyCategory] || "#8b5cf6";
      ctx.fill();
    });

  }, [scores, maxScore, size, labels]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}
