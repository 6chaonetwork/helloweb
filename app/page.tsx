"use client";

import { useState, type MouseEvent } from "react";
import { Comparison } from "@/components/Comparison";
import { CtaFooter } from "@/components/CtaFooter";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Scenarios } from "@/components/Scenarios";

export default function HomePage() {
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setSpotlight((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background: spotlight.active
            ? `radial-gradient(520px circle at ${spotlight.x}px ${spotlight.y}px, rgba(230,0,0,0.16), rgba(230,0,0,0.06) 24%, transparent 46%)`
            : "transparent",
          mixBlendMode: "screen",
        }}
      />
      <Navbar />
      <main className="relative z-10 bg-dark-base">
        <Hero />
        <Features />
        <Scenarios />
        <Comparison />
        <CtaFooter />
      </main>
    </div>
  );
}
