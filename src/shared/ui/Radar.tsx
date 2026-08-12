"use client";

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useModal } from "@/providers/ModalProvider";
import styles from "./Radar.module.css";

export interface RadarAxis {
  key: string;
  label: string;
  directionLabel?: string;
  value: number;
  icon?: string;
  fallbackText?: string;
}

interface RadarProps {
  axes: RadarAxis[];
  maxValue?: number;
  levels?: number;
  title?: string;
  className?: string;
  compact?: boolean;
}

const CENTER = 50;
const MAX_RADIUS = 32;
const LABEL_RADIUS = MAX_RADIUS * 1.2; 

function angleForIndex(index: number, total: number): number {
  return -Math.PI / 2 + (index * 2 * Math.PI) / total;
}

function pointAt(angle: number, radius: number): { x: number; y: number } {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function polygonPoints(radius: number, total: number): string {
  return Array.from({ length: total }, (_, i) => {
    const { x, y } = pointAt(angleForIndex(i, total), radius);
    return `${x},${y}`;
  }).join(" ");
}

export default function Radar({
  axes,
  maxValue = 100,
  levels = 4,
  title,
  className,
  compact = false,
}: RadarProps) {
  const total = axes.length;
  
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndices, setClickedIndices] = useState<number[]>([]);
  
  const { openModal } = useModal();

  const openLegend = () => {
    openModal({
      title: "アイコンについて",
      className: styles.legendModal,
      children: (
        <div className={styles.legendList}>
          {axes.map((axis) => (
            <div key={axis.key} className={styles.legendItem}>
              <span className={styles.iconBadge} style={{ width: 32, height: 32 }}>
                {axis.icon ? (
                  <Icon icon={axis.icon} className={styles.icon} style={{ width: 18, height: 18 }} aria-hidden="true" />
                ) : (
                  <span className={styles.iconFallback} aria-hidden="true">
                    {axis.fallbackText ?? axis.label.slice(0, 2)}
                  </span>
                )}
              </span>
              <span className={styles.legendLabel}>{axis.label}</span>
              <span className={styles.legendDirection}>{axis.directionLabel}</span>
            </div>
          ))}
        </div>
      ),
    });
  };

  const toggleClickIndex = (index: number) => {
    setClickedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const gridRings = useMemo(
    () =>
      Array.from({ length: levels }, (_, i) => {
        const fraction = (i + 1) / levels;
        return { fraction, points: polygonPoints(MAX_RADIUS * fraction, total) };
      }),
    [levels, total]
  );

  const dataPoints = useMemo(
    () =>
      axes
        .map((axis, i) => {
          const fraction = Math.max(0, Math.min(1, axis.value / maxValue));
          const { x, y } = pointAt(angleForIndex(i, total), MAX_RADIUS * fraction);
          return `${x},${y}`;
        })
        .join(" "),
    [axes, maxValue, total]
  );

  return (
    <div className={[styles.wrapper, compact && styles.compact, className].filter(Boolean).join(" ")}>
      {title && <h3 className={styles.title}>{title}</h3>}

      <button 
        type="button"
        className={styles.infoButton} 
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openLegend();
        }}
        aria-label="アイコン対照表"
      >
        <Icon icon="mdi:information-variant" width="20" height="20" />
      </button>

      <div className={styles.chartArea}>
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          role="img"
          aria-label={title ?? "レーダーチャート"}
        >
          {gridRings.map((ring) => (
            <polygon
              key={ring.fraction}
              points={ring.points}
              className={styles.gridRing}
            />
          ))}

          {axes.map((axis, i) => {
            const { x, y } = pointAt(angleForIndex(i, total), MAX_RADIUS);
            return (
              <line
                key={axis.key}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                className={styles.axisLine}
              />
            );
          })}

          <polygon points={dataPoints} className={styles.dataPolygon} />

          {axes.map((axis, i) => {
            const fraction = Math.max(0, Math.min(1, axis.value / maxValue));
            const { x, y } = pointAt(angleForIndex(i, total), MAX_RADIUS * fraction);
            return (
              <rect
                key={`hit-${axis.key}`}
                x={x - 5}
                y={y - 5}
                width={10}
                height={10}
                fill="transparent"
                className={styles.hitArea}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => toggleClickIndex(i)}
              />
            );
          })}
        </svg>

        {axes.map((axis, i) => {
          // ツールチップはホバーされているか、クリック固定されている場合に表示
          const isVisible = hoveredIndex === i || clickedIndices.includes(i);
          if (!isVisible) return null;

          const fraction = Math.max(0, Math.min(1, axis.value / maxValue));
          const { x, y } = pointAt(angleForIndex(i, total), MAX_RADIUS * fraction);
          return (
            <div
              key={`tooltip-${axis.key}`}
              className={styles.tooltipContainer}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className={styles.tooltipValue}>{axis.value}</span>
            </div>
          );
        })}

        {axes.map((axis, i) => {
          const { x, y } = pointAt(angleForIndex(i, total), LABEL_RADIUS);
          return (
            <div
              key={axis.key}
              className={styles.axisLabel}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className={styles.iconBadge}>
                {axis.icon ? (
                  <Icon icon={axis.icon} className={styles.icon} aria-hidden="true" />
                ) : (
                  <span className={styles.iconFallback} aria-hidden="true">
                    {axis.fallbackText ?? axis.label.slice(0, 2)}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
