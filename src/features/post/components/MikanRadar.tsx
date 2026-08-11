import React from "react";
import Radar, { RadarAxis } from "../../../shared/ui/Radar";

/** 果実評価の各キー型定義 */
export type MikanProfileKey =
  | "sweetness"
  | "tartness"
  | "umami"
  | "juiciness"
  | "thinness"
  | "aroma"
  | "texture";

export interface MikanRadarProps {
  values: Record<MikanProfileKey, number>;
  maxValue?: number;
  title?: string;
  className?: string;
}

const MIKAN_AXES_CONFIG: Omit<RadarAxis, "value">[] = [
  { key: "sweetness", label: "甘さ", directionLabel: "弱→強", icon: "mdi:candy" },
  { key: "tartness", label: "酸っぱさ", directionLabel: "強→弱", icon: "mdi:fruit-citrus" },
  { key: "umami", label: "コク・旨み", directionLabel: "弱→強", icon: "mdi:sparkles" },
  { key: "juiciness", label: "果汁感", directionLabel: "弱→強", icon: "mdi:water" },
  { key: "thinness", label: "皮の薄さ", directionLabel: "厚→薄", icon: "mdi:layers-outline" },
  { key: "aroma", label: "香り", directionLabel: "弱→強", icon: "mdi:scent" },
  { key: "texture", label: "歯応え", directionLabel: "弱→強", icon: "mdi:food-apple" },
];

export default function MikanRadar({
  values,
  maxValue = 10,
  title = "みかんレーダー",
  className,
}: MikanRadarProps) {
  const axes: RadarAxis[] = MIKAN_AXES_CONFIG.map((config) => ({
    ...config,
    value: values[config.key as MikanProfileKey] ?? 0,
  }));

  return (
    <Radar
      title={title}
      axes={axes}
      maxValue={maxValue}
      className={className}
    />
  );
}