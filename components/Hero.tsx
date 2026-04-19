"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { Apple, ArrowRight, ChevronDown, Monitor } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import templateRoles from "@/lib/data/helloclaw-template-roles.json";

type TemplateRole = {
  name: string;
  purpose: string;
};

type OrbitPoolState = {
  active: TemplateRole[];
  waiting: TemplateRole[];
};

type OrbitDirection = "clockwise" | "counterclockwise";

type OrbitTone = "mentor" | "operator";

type SwapPhase = "idle" | "out" | "in";

type SwapState = {
  slotIndex: number | null;
  phase: SwapPhase;
};

type OrbitNodeSlot = {
  role: TemplateRole;
  slotKey: string;
  swapPhase: SwapPhase;
};

type OrbitLayerDefinition = {
  id: string;
  nodes: OrbitNodeSlot[];
  radius: string;
  size: string;
  duration: number;
  direction: OrbitDirection;
  cardWidth: string;
  orbitLabel: string;
  tone: OrbitTone;
  compact?: boolean;
  startAngle?: number;
};

type OrbitLayerProps = {
  layer: OrbitLayerDefinition;
  paused: boolean;
  activeNode: string | null;
  setActiveNode: (nodeId: string | null) => void;
  prefersReducedMotion: boolean;
};

type OrbitalCanvasProps = {
  className?: string;
  layers: OrbitLayerDefinition[];
  compact?: boolean;
  paused: boolean;
  activeNode: string | null;
  setActiveNode: (nodeId: string | null) => void;
  prefersReducedMotion: boolean;
};

const assistantTemplates = templateRoles.assistantTemplates as TemplateRole[];
const workforceTemplates = templateRoles.workforceTemplates as TemplateRole[];

const ACTIVE_INNER_COUNT = 4;
const ACTIVE_OUTER_COUNT = 8;
const SWAP_INTERVAL_MS = 2800;
const SWAP_OUT_MS = 260;
const SWAP_IN_MS = 360;

function shuffleArray<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function createOrbitPool(items: TemplateRole[], activeCount: number): OrbitPoolState {
  const shuffled = shuffleArray(items);

  return {
    active: shuffled.slice(0, activeCount),
    waiting: shuffled.slice(activeCount),
  };
}

const energyBeams = [
  { angle: -24, width: "clamp(8rem, 15vw, 13rem)", delay: "-0.8s", duration: "5.4s" },
  { angle: 18, width: "clamp(9rem, 16vw, 14rem)", delay: "-2.2s", duration: "6.1s" },
  { angle: 56, width: "clamp(7rem, 12vw, 10rem)", delay: "-3.5s", duration: "4.9s" },
  { angle: 118, width: "clamp(8rem, 14vw, 11rem)", delay: "-1.6s", duration: "5.8s" },
  { angle: 176, width: "clamp(10rem, 18vw, 15rem)", delay: "-4.4s", duration: "6.4s" },
  { angle: 232, width: "clamp(7rem, 13vw, 11rem)", delay: "-2.8s", duration: "5.2s" },
  { angle: 304, width: "clamp(8rem, 15vw, 12rem)", delay: "-5.1s", duration: "6.3s" },
];

const fieldParticles = [
  { top: "10%", left: "16%", size: "0.24rem", delay: "-0.7s", duration: "8.2s" },
  { top: "18%", left: "78%", size: "0.28rem", delay: "-3.1s", duration: "9.4s" },
  { top: "24%", left: "58%", size: "0.22rem", delay: "-5.2s", duration: "7.1s" },
  { top: "34%", left: "12%", size: "0.18rem", delay: "-4.4s", duration: "8.8s" },
  { top: "39%", left: "86%", size: "0.3rem", delay: "-2.1s", duration: "10.4s" },
  { top: "48%", left: "24%", size: "0.22rem", delay: "-6.5s", duration: "7.8s" },
  { top: "58%", left: "72%", size: "0.26rem", delay: "-3.4s", duration: "9.9s" },
  { top: "66%", left: "8%", size: "0.2rem", delay: "-1.4s", duration: "8.6s" },
  { top: "72%", left: "46%", size: "0.18rem", delay: "-5.8s", duration: "7.3s" },
  { top: "81%", left: "84%", size: "0.24rem", delay: "-2.7s", duration: "10.2s" },
  { top: "88%", left: "26%", size: "0.28rem", delay: "-4.7s", duration: "9.1s" },
];

const purposeClampStyle: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
};

function OrbitLayer({
  layer,
  paused,
  activeNode,
  setActiveNode,
  prefersReducedMotion,
}: OrbitLayerProps) {
  const trackAnimation: CSSProperties = prefersReducedMotion
    ? { animation: "none" }
    : {
        animationName:
          layer.direction === "clockwise" ? "orbit-spin-cw" : "orbit-spin-ccw",
        animationDuration: `${layer.duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationPlayState: paused ? "paused" : "running",
      };

  const counterAnimation: CSSProperties = prefersReducedMotion
    ? { animation: "none" }
    : {
        animationName:
          layer.direction === "clockwise" ? "orbit-spin-ccw" : "orbit-spin-cw",
        animationDuration: `${layer.duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationPlayState: paused ? "paused" : "running",
      };

  return (
    <>
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 rounded-full border ${
          layer.tone === "mentor"
            ? "border-white/12"
            : "border-white/8 border-dashed"
        } bg-[radial-gradient(circle_at_center,rgba(255,36,0,0.06),transparent_70%)]`}
        style={{
          width: layer.size,
          height: layer.size,
          transform: "translate(-50%, -50%)",
          boxShadow:
            layer.tone === "mentor"
              ? "0 0 0 1px rgba(255,255,255,0.02), inset 0 0 40px rgba(255,36,0,0.08)"
              : "0 0 0 1px rgba(255,255,255,0.015), inset 0 0 36px rgba(255,255,255,0.02)",
        }}
      />

      <div className="pointer-events-none absolute inset-0" style={trackAnimation}>
        {layer.nodes.map((node, index) => {
          const angle =
            (layer.startAngle ?? -90) + (index / layer.nodes.length) * 360;
          const isActive = activeNode === node.slotKey;
          const isSwappingOut = node.swapPhase === "out";

          return (
            <div
              key={node.slotKey}
              className="absolute inset-0"
              style={{ zIndex: isActive ? 30 : 10 }}
            >
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${layer.radius})`,
                }}
              >
                <div className="pointer-events-auto" style={counterAnimation}>
                  <div style={{ transform: `rotate(${-angle}deg)` }}>
                    <div
                      onMouseEnter={() => setActiveNode(node.slotKey)}
                      onMouseLeave={() => setActiveNode(null)}
                      style={{
                        opacity: isSwappingOut ? 0 : 1,
                        transform: `scale(${isSwappingOut ? 0.8 : 1})`,
                        transition:
                          "opacity 260ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      <div
                        className={`relative overflow-hidden border bg-black/40 text-left backdrop-blur-md transition-[border-color,box-shadow,transform,background-color,color] duration-300 ${
                          layer.compact
                            ? "rounded-[18px] px-3 py-2.5"
                            : "rounded-[22px] px-4 py-3"
                        } ${
                          isActive
                            ? "border-claw-red bg-[linear-gradient(180deg,rgba(26,6,6,0.96),rgba(10,10,10,0.88))] shadow-[0_0_0_1px_rgba(255,36,0,0.45),0_0_24px_rgba(255,36,0,0.18),0_0_50px_rgba(230,0,0,0.2)]"
                            : layer.tone === "mentor"
                              ? "border-white/12 shadow-[0_12px_34px_rgba(0,0,0,0.34)]"
                              : "border-white/10 shadow-[0_10px_26px_rgba(0,0,0,0.28)]"
                        }`}
                        style={{
                          width: layer.cardWidth,
                          transform: isActive ? "translateY(-4px) scale(1.04)" : "none",
                        }}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,36,0,0.18),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]" />
                        <div className="relative">
                          <div
                            className={`font-mono uppercase tracking-[0.22em] ${
                            layer.compact ? "text-[8px]" : "text-[9px]"
                          } ${isActive ? "text-claw-red-glow" : "text-white/38"}`}
                          >
                            {layer.orbitLabel}
                          </div>
                          <div
                            className={`mt-1 truncate font-semibold ${
                            layer.compact ? "text-[12px]" : "text-[13.5px]"
                          } ${isActive ? "text-white" : "text-white/92"}`}
                          >
                            {node.role.name}
                          </div>
                          <p
                            className={`mt-1.5 leading-[1.35] ${
                            layer.compact ? "text-[10px]" : "text-[11px]"
                          } ${isActive ? "text-white/84" : "text-white/58"}`}
                            style={purposeClampStyle}
                          >
                            {node.role.purpose}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 rounded-full"
        style={{
          width: layer.size,
          height: layer.size,
          transform: "translate(-50%, -50%)",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 36%, rgba(255,255,255,0.015) 52%, rgba(255,36,0,0.08) 75%, rgba(255,255,255,0.07) 100%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 41%, black 45%, black 56%, transparent 60%)",
          maskImage:
            "radial-gradient(circle, transparent 41%, black 45%, black 56%, transparent 60%)",
        }}
      />
    </>
  );
}

function OrbitalCanvas({
  className,
  layers,
  compact = false,
  paused,
  activeNode,
  setActiveNode,
  prefersReducedMotion,
}: OrbitalCanvasProps) {
  const visibleBeams = compact ? energyBeams.slice(0, 4) : energyBeams;
  const visibleParticles = compact ? fieldParticles.slice(0, 8) : fieldParticles;

  return (
    <div
      className={`scanlines relative h-full w-full overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,8,8,0.95),rgba(4,4,4,0.88))] shadow-[0_34px_120px_rgba(0,0,0,0.58)] ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,0,0,0.12),transparent_24%),radial-gradient(circle_at_50%_54%,rgba(255,36,0,0.09),transparent_34%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.18] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_90%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0.6px,transparent_0.8px)] bg-[size:24px_24px] opacity-[0.08]" />

      {visibleParticles.map((particle, index) => (
        <span
          key={`${particle.top}-${particle.left}-${index}`}
          className="pointer-events-none absolute rounded-full bg-claw-red-glow/75 shadow-[0_0_10px_rgba(255,36,0,0.34)]"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animation: prefersReducedMotion
              ? "none"
              : `field-particle ${particle.duration} ease-in-out infinite`,
            animationDelay: particle.delay,
          }}
        />
      ))}

      {visibleBeams.map((beam, index) => (
        <div
          key={`${beam.angle}-${index}`}
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{ transform: `translate(-50%, -50%) rotate(${beam.angle}deg)` }}
        >
          <div
            className="relative h-px origin-left"
            style={{ width: beam.width }}
          >
            <span
              className="absolute left-0 top-0 h-px w-full origin-left bg-[linear-gradient(90deg,rgba(255,36,0,0.62),rgba(255,36,0,0.18),transparent)] shadow-[0_0_18px_rgba(255,36,0,0.18)]"
              style={{
                animation: prefersReducedMotion
                  ? "none"
                  : `beam-pulse ${beam.duration} ease-out infinite`,
                animationDelay: beam.delay,
              }}
            />
            <span
              className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-claw-red-glow shadow-[0_0_10px_rgba(255,36,0,0.7)]"
              style={{
                animation: prefersReducedMotion
                  ? "none"
                  : `packet-travel ${beam.duration} linear infinite`,
                animationDelay: beam.delay,
                ["--packet-distance" as string]: beam.width,
              }}
            />
          </div>
        </div>
      ))}

      {layers.map((layer) => (
        <OrbitLayer
          key={layer.id}
          layer={layer}
          paused={paused}
          activeNode={activeNode}
          setActiveNode={setActiveNode}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[28px] border border-claw-red/28 bg-claw-red/10 ${
            compact ? "h-[4.5rem] w-[4.5rem]" : "h-28 w-28"
          }`}
          style={{
            animation: prefersReducedMotion ? "none" : "core-pulse 5.6s ease-in-out infinite",
          }}
        />
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-claw-red/24 blur-3xl ${
            compact ? "h-20 w-20" : "h-32 w-32"
          }`}
          style={{
            animation: prefersReducedMotion ? "none" : "core-halo 4.8s ease-in-out infinite",
          }}
        />
        <div
          className={`relative flex items-center justify-center rounded-full border border-claw-red/30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),rgba(255,36,0,0.22),rgba(5,5,5,0.96))] text-center shadow-[0_0_0_1px_rgba(255,36,0,0.22),0_0_34px_rgba(255,36,0,0.22),0_0_88px_rgba(230,0,0,0.16)] ${
            compact ? "h-20 w-20" : "h-28 w-28"
          }`}
        >
          <div className="absolute inset-[8px] rounded-full border border-white/10" />
          <div className="relative px-3">
            <div
              className={`font-mono uppercase tracking-[0.24em] text-white/42 ${
                compact ? "text-[8px]" : "text-[9px]"
              }`}
            >
              主控核心
            </div>
            <div
              className={`mt-1 font-semibold text-white ${
                compact ? "text-sm" : "text-lg"
              }`}
            >
              HelloClaw
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [innerOrbit, setInnerOrbit] = useState<OrbitPoolState>(() =>
    createOrbitPool(assistantTemplates, ACTIVE_INNER_COUNT),
  );
  const [outerOrbit, setOuterOrbit] = useState<OrbitPoolState>(() =>
    createOrbitPool(workforceTemplates, ACTIVE_OUTER_COUNT),
  );
  const [innerSwap, setInnerSwap] = useState<SwapState>({
    slotIndex: null,
    phase: "idle",
  });
  const [outerSwap, setOuterSwap] = useState<SwapState>({
    slotIndex: null,
    phase: "idle",
  });
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const orbitPaused = !prefersReducedMotion && activeNode !== null;
  const swapTimeoutsRef = useRef<number[]>([]);

  const swapOrbitNode = useEffectEvent((orbit: "inner" | "outer") => {
    const currentOrbit = orbit === "inner" ? innerOrbit : outerOrbit;
    const currentSwap = orbit === "inner" ? innerSwap : outerSwap;
    const setSwap = orbit === "inner" ? setInnerSwap : setOuterSwap;
    const setOrbit = orbit === "inner" ? setInnerOrbit : setOuterOrbit;

    if (
      currentSwap.phase !== "idle" ||
      currentOrbit.active.length === 0 ||
      currentOrbit.waiting.length === 0
    ) {
      return;
    }

    const slotIndex = Math.floor(Math.random() * currentOrbit.active.length);

    setSwap({ slotIndex, phase: "out" });

    const swapTimeout = window.setTimeout(() => {
      setOrbit((previousOrbit) => {
        if (
          previousOrbit.waiting.length === 0 ||
          slotIndex < 0 ||
          slotIndex >= previousOrbit.active.length
        ) {
          return previousOrbit;
        }

        const waitingIndex = Math.floor(
          Math.random() * previousOrbit.waiting.length,
        );
        const nextRole = previousOrbit.waiting[waitingIndex];
        const replacedRole = previousOrbit.active[slotIndex];
        const nextActive = previousOrbit.active.slice();
        const nextWaiting = previousOrbit.waiting.slice();

        nextActive[slotIndex] = nextRole;
        nextWaiting.splice(waitingIndex, 1);
        nextWaiting.push(replacedRole);

        return {
          active: nextActive,
          waiting: nextWaiting,
        };
      });

      setSwap({ slotIndex, phase: "in" });

      const settleTimeout = window.setTimeout(() => {
        setSwap({ slotIndex: null, phase: "idle" });
      }, SWAP_IN_MS);

      swapTimeoutsRef.current.push(settleTimeout);
    }, SWAP_OUT_MS);

    swapTimeoutsRef.current.push(swapTimeout);
  });

  const runSwapCycle = useEffectEvent(() => {
    if (activeNode !== null) {
      return;
    }

    swapOrbitNode("inner");
    swapOrbitNode("outer");
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      runSwapCycle();
    }, SWAP_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      swapTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      swapTimeoutsRef.current = [];
    };
  }, []);

  const buildOrbitSlots = (
    roles: TemplateRole[],
    prefix: "inner" | "outer",
    swapState: SwapState,
    startIndex = 0,
  ): OrbitNodeSlot[] =>
    roles.map((role, localIndex) => {
      const slotIndex = startIndex + localIndex;

      return {
        role,
        slotKey: `${prefix}-${slotIndex}`,
        swapPhase:
          swapState.slotIndex === slotIndex ? swapState.phase : "idle",
      };
    });

  const outerMidpoint = Math.ceil(outerOrbit.active.length / 2);
  const innerSlots = buildOrbitSlots(innerOrbit.active, "inner", innerSwap);
  const outerPrimarySlots = buildOrbitSlots(
    outerOrbit.active.slice(0, outerMidpoint),
    "outer",
    outerSwap,
    0,
  );
  const outerSecondarySlots = buildOrbitSlots(
    outerOrbit.active.slice(outerMidpoint),
    "outer",
    outerSwap,
    outerMidpoint,
  );

  const desktopOrbitLayers: OrbitLayerDefinition[] = [
    {
      id: "inner-mentors",
      nodes: innerSlots,
      radius: "clamp(10rem, 18vw, 12rem)",
      size: "calc(clamp(10rem, 18vw, 12rem) * 2)",
      duration: 60,
      direction: "clockwise",
      cardWidth: "clamp(7rem, 8vw, 8.25rem)",
      orbitLabel: "导师智囊团",
      tone: "mentor",
      startAngle: -90,
    },
    {
      id: "outer-operations-a",
      nodes: outerPrimarySlots,
      radius: "clamp(15rem, 28vw, 18.5rem)",
      size: "calc(clamp(15rem, 28vw, 18.5rem) * 2)",
      duration: 40,
      direction: "counterclockwise",
      cardWidth: "clamp(7.5rem, 8vw, 8.75rem)",
      orbitLabel: "业务执行层",
      tone: "operator",
      startAngle: -78,
    },
    {
      id: "outer-operations-b",
      nodes: outerSecondarySlots,
      radius: "clamp(20rem, 35vw, 23.5rem)",
      size: "calc(clamp(20rem, 35vw, 23.5rem) * 2)",
      duration: 52,
      direction: "counterclockwise",
      cardWidth: "clamp(7.5rem, 8vw, 8.75rem)",
      orbitLabel: "业务执行层",
      tone: "operator",
      startAngle: -54,
    },
  ];

  const mobileOrbitLayers: OrbitLayerDefinition[] = [
    {
      id: "mobile-mentors",
      nodes: innerSlots,
      radius: "5.8rem",
      size: "11.6rem",
      duration: 42,
      direction: "clockwise",
      cardWidth: "6rem",
      orbitLabel: "导师智囊团",
      tone: "mentor",
      compact: true,
      startAngle: -90,
    },
    {
      id: "mobile-operations-a",
      nodes: outerPrimarySlots,
      radius: "9.1rem",
      size: "18.2rem",
      duration: 30,
      direction: "counterclockwise",
      cardWidth: "6.25rem",
      orbitLabel: "业务执行层",
      tone: "operator",
      compact: true,
      startAngle: -82,
    },
    {
      id: "mobile-operations-b",
      nodes: outerSecondarySlots,
      radius: "11.9rem",
      size: "23.8rem",
      duration: 37,
      direction: "counterclockwise",
      cardWidth: "6.25rem",
      orbitLabel: "业务执行层",
      tone: "operator",
      compact: true,
      startAngle: -40,
    },
  ];

  return (
    <section
      id="hero"
      className="relative isolate min-h-screen overflow-x-hidden px-4 pb-10 pt-10 md:px-8 md:pt-16"
    >
      <style>{`
        @keyframes neonBreath {
          0%, 100% {
            text-shadow:
              0 0 10px rgba(230,0,0,0.4),
              0 0 20px rgba(230,0,0,0.2);
            opacity: 0.9;
          }
          50% {
            text-shadow:
              0 0 25px rgba(230,0,0,0.8),
              0 0 50px rgba(230,0,0,0.5);
            opacity: 1;
          }
        }
        .breathing-text {
          animation: neonBreath 4s ease-in-out infinite;
        }
        @keyframes orbit-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes core-pulse {
          0%, 100% {
            opacity: 0.55;
            transform: translate(-50%, -50%) rotate(45deg) scale(0.96);
            box-shadow: 0 0 0 rgba(255, 36, 0, 0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(45deg) scale(1.08);
            box-shadow: 0 0 32px rgba(255, 36, 0, 0.22);
          }
        }
        @keyframes core-halo {
          0%, 100% {
            opacity: 0.42;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.78;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }
        @keyframes beam-pulse {
          0% {
            opacity: 0;
            transform: scaleX(0.08);
          }
          18% {
            opacity: 0.9;
          }
          65% {
            opacity: 0.28;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(1.08);
          }
        }
        @keyframes packet-travel {
          0% {
            opacity: 0;
            transform: translate(0, -50%) scale(0.75);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--packet-distance), -50%) scale(1.05);
          }
        }
        @keyframes field-particle {
          0%, 100% {
            opacity: 0.2;
            transform: translate3d(0, 0, 0) scale(0.85);
          }
          50% {
            opacity: 1;
            transform: translate3d(0, -10px, 0) scale(1.2);
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 z-[-1]"
        style={{
          background:
            "radial-gradient(circle at 50% 60%, rgba(230, 0, 0, 0.15), rgba(0, 0, 0, 0) 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,rgba(0,0,0,0.08))]" />
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(circle,rgba(255,255,255,0.045)_0.6px,transparent_0.8px)] bg-[size:22px_22px] opacity-[0.05]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center text-center">
        <div className="w-full max-w-6xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl text-4xl font-bold leading-tight tracking-[0.02em] md:text-6xl md:leading-[1.1] lg:text-7xl lg:leading-[1.05]"
          >
            <span className="block text-white leading-[1.2] md:whitespace-nowrap md:leading-[1.25]">
              全球最简单易操作的
            </span>
            <br />
            <span className="breathing-text block text-white leading-[1.2] md:whitespace-nowrap md:leading-[1.25]">
              AI 多智能体协作平台
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 max-w-3xl text-balance text-lg leading-8 text-gray-400 md:text-xl"
          >
            一键安装，快速上手，让一个人也能拥有一个 AI 团队，把长期任务、协作流程和交付工作流真正跑起来。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 18,
              delay: 0.24,
            }}
            className="mt-10 flex w-full flex-col items-center justify-center gap-4 md:flex-row md:flex-wrap"
          >
            <Link
              href="/login"
              className="inline-flex w-full max-w-[20rem] items-center justify-center gap-2 rounded-lg border border-white/20 bg-transparent px-6 py-3 text-white transition-all hover:bg-white/10 md:w-auto md:max-w-none"
            >
              <Monitor size={18} />
              <span>Windows版下载</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full max-w-[20rem] items-center justify-center gap-2 rounded-lg border border-white/20 bg-transparent px-6 py-3 text-white transition-all hover:bg-white/10 md:w-auto md:max-w-none"
            >
              <Apple size={18} />
              <span>Mac版下载</span>
            </Link>
            <a
              href="#intro"
              className="inline-flex w-full max-w-[20rem] items-center justify-center gap-2 rounded-lg bg-claw-red px-6 py-3 font-bold text-white shadow-[0_0_20px_rgba(230,0,0,0.6)] transition-all hover:shadow-[0_0_32px_rgba(230,0,0,0.85)] md:w-auto md:max-w-none"
            >
              <span>查看产品介绍</span>
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>

        <div className="mt-18 hidden w-full max-w-[76rem] md:block">
          <div className="relative h-[44rem] w-full lg:h-[48rem] xl:h-[52rem]">
            <OrbitalCanvas
              layers={desktopOrbitLayers}
              paused={orbitPaused}
              activeNode={activeNode}
              setActiveNode={setActiveNode}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>

        <div className="mt-14 w-full md:hidden">
          <div className="mx-auto max-w-[24rem]">
            <div className="relative h-[18rem] overflow-hidden sm:h-[20rem]">
              <div className="absolute left-1/2 top-0 w-[24rem] -translate-x-1/2 origin-top scale-[0.72] transform sm:scale-[0.84] lg:scale-100 lg:origin-center">
                <div className="relative h-[24rem] w-[24rem]">
                  <OrbitalCanvas
                    layers={mobileOrbitLayers}
                    compact
                    paused={orbitPaused}
                    activeNode={activeNode}
                    setActiveNode={setActiveNode}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.a
          href="#intro"
          initial={{ opacity: 0, y: 12 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 1, y: [0, 8, 0] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.5, delay: 0.6 }
              : {
                  opacity: { duration: 0.5, delay: 0.6 },
                  y: { duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                }
          }
          className="mt-10 inline-flex items-center justify-center rounded-full border border-claw-red/18 bg-white/4 p-3 text-claw-red-glow shadow-[0_0_20px_rgba(255,36,0,0.16)]"
          aria-label="Scroll to next section"
        >
          <ChevronDown size={22} />
        </motion.a>
      </div>
    </section>
  );
}
