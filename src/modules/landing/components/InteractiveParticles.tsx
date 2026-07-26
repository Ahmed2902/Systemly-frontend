"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; vx: number; vy: number };

export function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointer = { x: -1000, y: -1000 };
    let points: Point[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(42, Math.min(110, Math.floor(width / 14)));
      points = Array.from({ length: count }, (_, index) => {
        const edge = index % 2 === 0 ? Math.random() * width * 0.32 : width * 0.68 + Math.random() * width * 0.32;
        return {
          x: edge,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
        };
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onPointerLeave = () => (pointer = { x: -1000, y: -1000 });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const point of points) {
        const dx = point.x - pointer.x;
        const dy = point.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 130 && distance > 0) {
          const force = (130 - distance) / 130;
          point.vx += (dx / distance) * force * 0.035;
          point.vy += (dy / distance) * force * 0.035;
        }
        point.x += point.vx;
        point.y += point.vy;
        point.vx *= 0.992;
        point.vy *= 0.992;
        if (point.x < -20) point.x = width + 20;
        if (point.x > width + 20) point.x = -20;
        if (point.y < -20) point.y = height + 20;
        if (point.y > height + 20) point.y = -20;
      }

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i];
          const b = points[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > 125) continue;
          const alpha = (1 - distance / 125) * 0.24;
          ctx.strokeStyle = `rgba(37, 201, 143, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const point of points) {
        const glow = Math.hypot(point.x - pointer.x, point.y - pointer.y) < 150;
        ctx.fillStyle = glow ? "rgba(146, 255, 216, .95)" : "rgba(52, 207, 151, .72)";
        ctx.beginPath();
        ctx.arc(point.x, point.y, glow ? 2.1 : 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="lp-particles" aria-hidden="true" />;
}
