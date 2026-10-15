"use client";

import React, { useMemo } from "react";
import { Radio, Crosshair, Compass, Globe } from "lucide-react";
import type { GroundTrackPoint } from "@/lib/replay/types";

interface GroundTrackMapProps {
  station: {
    lat: number;
    lon: number;
    name: string;
    altM: number;
  };
  groundTrack: GroundTrackPoint[];
  currentPoint: GroundTrackPoint | null;
  inView: boolean;
  elevationDeg: number;
  azimuthDeg: number;
}

export function GroundTrackMap({
  station,
  groundTrack,
  currentPoint,
  inView,
  elevationDeg,
  azimuthDeg,
}: GroundTrackMapProps) {
  const width = 800;
  const height = 400;

  // Equirectangular projection
  // lon: -180..+180 -> 0..800
  // lat: +90..-90 -> 0..400
  const project = (lat: number, lon: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [Math.max(0, Math.min(width, x)), Math.max(0, Math.min(height, y))];
  };

  const polylinePoints = useMemo(() => {
    if (!groundTrack || groundTrack.length === 0) return "";
    return groundTrack
      .map((pt) => {
        const [x, y] = project(pt.lat, pt.lon);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [groundTrack]);

  const [stationX, stationY] = project(station.lat, station.lon);
  const [satX, satY] = currentPoint
    ? project(currentPoint.lat, currentPoint.lon)
    : [stationX, stationY];

  // Visibility horizon radius (~18 degrees for LEO at 10 deg elevation)
  const rx = (18 / 360) * width;
  const ry = (18 / 180) * height;

  return (
    <div className="relative w-full h-[360px] bg-zinc-950 rounded-lg overflow-hidden flex flex-col justify-between">
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur px-3 py-1.5 rounded text-xs font-mono text-zinc-300">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span>GROUND TRACK</span>
          <span className="text-zinc-500 font-sans text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-800">
            DERIVED (SGP4)
          </span>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur px-3 py-1.5 rounded text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              inView ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span className={inView ? "text-emerald-300 font-medium" : "text-zinc-400"}>
            {inView ? "IN ACQUISITION OF SIGNAL (AOS)" : "BELOW HORIZON (LOS)"}
          </span>
        </div>
      </div>

      {/* SVG Orbital Canvas */}
      <div className="w-full h-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id="orbital-grid"
              width={width / 12}
              height={height / 6}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${width / 12} 0 L 0 0 0 ${height / 6}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Deep Space Background & Coordinate Grids */}
          <rect width={width} height={height} fill="#09090b" />
          <rect width={width} height={height} fill="url(#orbital-grid)" />

          {/* Equator & Prime Meridian */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeDasharray="4 4"
          />
          <line
            x1={width / 2}
            y1="0"
            x2={width / 2}
            y2={height}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeDasharray="4 4"
          />

          {/* Station Visibility Footprint */}
          <ellipse
            cx={stationX}
            cy={stationY}
            rx={rx}
            ry={ry}
            fill={inView ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.03)"}
            stroke={inView ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)"}
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Sampled Orbital Track */}
          {polylinePoints && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#71717a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Line of Sight Vector */}
          {currentPoint && inView && (
            <line
              x1={stationX}
              y1={stationY}
              x2={satX}
              y2={satY}
              stroke="rgba(16, 185, 129, 0.6)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Ground Station Marker */}
          <g transform={`translate(${stationX}, ${stationY})`}>
            <circle r="4" fill="#fafafa" />
            <circle
              r="10"
              fill="none"
              stroke="#fafafa"
              strokeWidth="1"
              opacity="0.4"
            />
            <text
              x="8"
              y="3"
              fill="#a1a1aa"
              fontSize="9"
              fontFamily="monospace"
            >
              GS: {station.name.split(" ")[0]}
            </text>
          </g>

          {/* Satellite Marker */}
          {currentPoint && (
            <g transform={`translate(${satX}, ${satY})`}>
              <circle
                r={inView ? "6" : "4"}
                fill={inView ? "#34d399" : "#e4e4e7"}
              />
              <circle
                r="12"
                fill="none"
                stroke={inView ? "#34d399" : "#a1a1aa"}
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x="10"
                y="-4"
                fill="#ffffff"
                fontSize="10"
                fontWeight="600"
                fontFamily="monospace"
              >
                SAT (AO-91)
              </text>
              <text
                x="10"
                y="8"
                fill="#a1a1aa"
                fontSize="8"
                fontFamily="monospace"
              >
                {currentPoint.lat.toFixed(1)}°, {currentPoint.lon.toFixed(1)}°
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Telemetry Overlay Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 bg-zinc-900/90 backdrop-blur px-3 py-1.5 rounded text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-zinc-400" />
            <span>Station: {station.name}</span>
          </div>
          <div className="text-zinc-500">
            {station.lat.toFixed(2)}° N, {station.lon.toFixed(2)}° E
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/90 backdrop-blur px-3 py-1.5 rounded text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <span>Az: {azimuthDeg.toFixed(1)}°</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
            <span>El: {elevationDeg.toFixed(1)}°</span>
          </div>
          <div className="text-zinc-500">
            Alt: {currentPoint ? `${Math.round(currentPoint.altM / 1000)} km` : "--"}
          </div>
        </div>
      </div>
    </div>
  );
}
