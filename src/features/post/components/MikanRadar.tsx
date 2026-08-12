import React from "react";
import Radar, { RadarAxis } from "../../../shared/ui/Radar";
import { MIKAN_AXES_CONFIG, type MikanProfileKey, type MikanProfileValues } from "../types/mikanProfile";
export type { MikanProfileKey, MikanProfileValues } from "../types/mikanProfile";

/** 果実評価の各キー型定義 */
export interface MikanRadarProps {
  values: MikanProfileValues;
  maxValue?: number;
  title?: string;
  className?: string;
  compact?: boolean;
}


export default function MikanRadar({
  values,
  maxValue = 10,
  title = "みかんレーダー",
  className,
  compact = false,
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
      compact={compact}
    />
  );
}
