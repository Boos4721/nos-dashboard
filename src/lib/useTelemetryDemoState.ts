"use client";

import { useEffect, useMemo, useState } from "react";

export type TelemetryDemoState = {
  hashrate: string;
  totalNodes: number;
  activeRegions: number;
  uptime: string;
  blockNumber: number;
  gasPriceGwei: string;
  txCount: number;
  signalArc: number;
  routeCapacity: number;
  pulseLatencyMs: number;
  selectedNodeBoost: number;
  selectedNodeLabel: string;
  updatedAt: number;
};

const BASE_HASHRATE = 28.4;
const BASE_NODES = 246;
const BASE_REGIONS = 8;
const BASE_UPTIME = 99.982;
const BASE_BLOCK = 2897341;
const BASE_ROUTE_CAPACITY = 93;
const BASE_SIGNAL_ARC = 88;
const BASE_PULSE_LATENCY = 71;
const DEMO_HUBS = ["宜昌主枢纽", "克拉玛依骨干", "杭州边缘入口", "香港公网中继", "新加坡国际接入"];

function formatHashrate(value: number) {
  return `${value.toFixed(1)} PH/s`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function computeDemoState(now = Date.now()): TelemetryDemoState {
  const tick = Math.floor(now / 15000);
  const wave = Math.sin(tick / 2.2);
  const subwave = Math.cos(tick / 3.7);

  return {
    hashrate: formatHashrate(BASE_HASHRATE + wave * 0.7 + subwave * 0.25),
    totalNodes: BASE_NODES + Math.round(wave * 5 + subwave * 3),
    activeRegions: BASE_REGIONS,
    uptime: `${(BASE_UPTIME + subwave * 0.006).toFixed(3)}%`,
    blockNumber: BASE_BLOCK + tick,
    gasPriceGwei: (0.16 + ((tick % 9) * 0.013)).toFixed(3),
    txCount: 112 + (tick % 37),
    signalArc: clamp(Math.round(BASE_SIGNAL_ARC + wave * 5), 82, 96),
    routeCapacity: clamp(Math.round(BASE_ROUTE_CAPACITY + subwave * 4), 88, 98),
    pulseLatencyMs: clamp(Math.round(BASE_PULSE_LATENCY - wave * 8 + subwave * 2), 58, 84),
    selectedNodeBoost: clamp(Math.round(((wave + 1) / 2) * 100), 18, 100),
    selectedNodeLabel: DEMO_HUBS[tick % DEMO_HUBS.length],
    updatedAt: now,
  };
}

export function useTelemetryDemoState(pollIntervalMs = 15000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((prev) => prev + 1), pollIntervalMs);
    return () => window.clearInterval(id);
  }, [pollIntervalMs]);

  return useMemo(() => computeDemoState(), [tick]);
}
