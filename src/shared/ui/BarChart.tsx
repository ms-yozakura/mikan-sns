import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "./BarChart.module.css";

export interface BarChartItem {
  key: string;
  label: string;
  value: number;
  icon?: string;
  fallbackText?: string;
}

export type SortOrder = "default" | "desc" | "asc";
export type Orientation = "vertical" | "horizontal";
export type VisibleCount = "auto" | number | "all";

interface BarChartProps {
  data: BarChartItem[];
  maxValue?: number;
  title?: string;
  className?: string;
  defaultOrientation?: Orientation;
  defaultSortOrder?: SortOrder;
  defaultVisibleCount?: VisibleCount;
  showIcons?: boolean;
}

export default function BarChart({
  data,
  maxValue,
  title,
  className,
  defaultOrientation = "vertical",
  defaultSortOrder = "default",
  defaultVisibleCount = "auto",
  showIcons = false,
}: BarChartProps) {
  const [orientation, setOrientation] = useState<Orientation>(defaultOrientation);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const [visibleCount, setVisibleCount] = useState<VisibleCount>(defaultVisibleCount);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [clickedKeys, setClickedKeys] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const computedMaxValue = useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    const max = Math.max(...data.map((item) => item.value), 0);
    return max === 0 ? 100 : max;
  }, [data, maxValue]);

  // 三種のソート処理
  const sortedData = useMemo(() => {
    const list = [...data];
    if (sortOrder === "desc") {
      return list.sort((a, b) => b.value - a.value);
    } else if (sortOrder === "asc") {
      return list.sort((a, b) => a.value - b.value);
    }
    return list;
  }, [data, sortOrder]);

  // 5件・10件ボタンを表示するか
  const canShow5 = data.length > 5;
  const canShow10 = data.length > 10;

  // 目盛は四分位数
  const gridTicks = useMemo(() => {
    const levels = 4;
    return Array.from({ length: levels + 1 }, (_, i) => {
      const fraction = i / levels;
      const val = Math.round(computedMaxValue * fraction);
      return { fraction, value: val, percentage: `${fraction * 100}%` };
    });
  }, [computedMaxValue]);

  // トラック幅・各要素幅の計算
  const { trackSizeStyle, itemSizeStyle } = useMemo(() => {
    const total = sortedData.length;
    if (total === 0) return { trackSizeStyle: {}, itemSizeStyle: {} };

    let count: number | null = null;
    if (typeof visibleCount === "number") {
      count = visibleCount;
    }

    if (count !== null && total > count) {
      const trackMultiplier = (total / count) * 100;
      const itemPercentage = 100 / total;

      if (orientation === "vertical") {
        return {
          trackSizeStyle: { width: `${trackMultiplier}%`, minWidth: "100%" },
          itemSizeStyle: { width: `${itemPercentage}%` },
        };
      } else {
        return {
          trackSizeStyle: { height: `${trackMultiplier}%`, minHeight: "100%" },
          itemSizeStyle: { height: `${itemPercentage}%` },
        };
      }
    }

    // デフォルト（auto または全件収まる場合）
    const itemPercentage = 100 / total;
    if (orientation === "vertical") {
      return {
        trackSizeStyle: { width: "100%" },
        itemSizeStyle: { width: `${itemPercentage}%` },
      };
    } else {
      return {
        trackSizeStyle: { height: "100%" },
        itemSizeStyle: { height: `${itemPercentage}%` },
      };
    }
  }, [sortedData.length, visibleCount, orientation]);

  // ツールチップのトグル
  const toggleClickKey = (key: string) => {
    setClickedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      {title && <h3 className={styles.title}>{title}</h3>}

      <button
        className={styles.settingsButton}
        onClick={() => setIsModalOpen(true)}
        aria-label="グラフの表示設定"
        title="グラフの表示設定"
      >
        <Icon icon="mdi:tune-variant" width="20" height="20" />
      </button>

      <div
        className={`${styles.chartContainer} ${
          orientation === "vertical"
            ? styles.verticalContainer
            : styles.horizontalContainer
        }`}
      >
        <div className={styles.gridLayer}>
          {gridTicks.map((tick) => (
            <React.Fragment key={tick.fraction}>
              {orientation === "vertical" ? (
                <div
                  className={styles.gridLineH}
                  style={{ bottom: tick.percentage }}
                >
                  <span className={styles.gridLabelY}>{tick.value}</span>
                </div>
              ) : (
                <div
                  className={styles.gridLineV}
                  style={{ left: tick.percentage }}
                >
                  <span className={styles.gridLabelX}>{tick.value}</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className={styles.scrollArea}>
          <div
            className={`${styles.barTrack} ${
              orientation === "vertical"
                ? styles.verticalTrack
                : styles.horizontalTrack
            }`}
            style={trackSizeStyle}
          >
            {sortedData.map((item) => {
              const fraction = Math.max(0, Math.min(1, item.value / computedMaxValue));
              const percentage = `${(fraction * 100).toFixed(1)}%`;
              const isTooltipVisible =
                hoveredKey === item.key || clickedKeys.includes(item.key);

              return (
                <div
                  key={item.key}
                  className={`${styles.barItem} ${
                    orientation === "vertical"
                      ? styles.barItemVertical
                      : styles.barItemHorizontal
                  }`}
                  style={itemSizeStyle}
                >
                  {/* 横向きグラフのラベルエリア（左側） */}
                  {orientation === "horizontal" && (
                    <div className={styles.labelAreaHorizontal}>
                      <span
                        className={`${styles.labelText} ${styles.horizontalText}`}
                        title={item.label}
                      >
                        {item.label}
                      </span>
                      {showIcons && (
                        <span className={styles.iconBadge}>
                          {item.icon ? (
                            <Icon icon={item.icon} className={styles.icon} aria-hidden="true" />
                          ) : (
                            <span className={styles.iconFallback} aria-hidden="true">
                              {item.fallbackText ?? item.label.slice(0, 2)}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  {/* バー領域 */}
                  <div
                    className={
                      orientation === "vertical"
                        ? styles.barAreaVertical
                        : styles.barAreaHorizontal
                    }
                  >
                    <div
                      className={`${styles.bar} ${
                        orientation === "vertical"
                          ? `${styles.verticalBar} ${styles.barAnimatedVertical}`
                          : `${styles.horizontalBar} ${styles.barAnimatedHorizontal}`
                      }`}
                      style={
                        orientation === "vertical"
                          ? { height: percentage }
                          : { width: percentage }
                      }
                      onMouseEnter={() => setHoveredKey(item.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onClick={() => toggleClickKey(item.key)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.label}: ${item.value}`}
                    >
                      {isTooltipVisible && (
                        <div
                          className={`${styles.tooltip} ${
                            orientation === "vertical"
                              ? styles.verticalTooltip
                              : styles.horizontalTooltip
                          }`}
                        >
                          <span>{item.value}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 縦向きグラフのラベルエリア（下側・縦書き対応） */}
                  {orientation === "vertical" && (
                    <div className={styles.labelAreaVertical}>
                      {showIcons && (
                        <span className={styles.iconBadge}>
                          {item.icon ? (
                            <Icon icon={item.icon} className={styles.icon} aria-hidden="true" />
                          ) : (
                            <span className={styles.iconFallback} aria-hidden="true">
                              {item.fallbackText ?? item.label.slice(0, 2)}
                            </span>
                          )}
                        </span>
                      )}
                      <span
                        className={`${styles.labelText} ${styles.verticalText}`}
                        title={item.label}
                      >
                        {item.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 設定モーダル */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>グラフの設定</h4>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
                aria-label="閉じる"
              >
                <Icon icon="mdi:close" width="24" height="24" />
              </button>
            </div>

            {/* 並び順 */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>並び順</span>
              <div className={styles.optionGroup}>
                <button
                  className={`${styles.optionButton} ${
                    sortOrder === "default" ? styles.active : ""
                  }`}
                  onClick={() => setSortOrder("default")}
                >
                  標準
                </button>
                <button
                  className={`${styles.optionButton} ${
                    sortOrder === "desc" ? styles.active : ""
                  }`}
                  onClick={() => setSortOrder("desc")}
                >
                  降順
                </button>
                <button
                  className={`${styles.optionButton} ${
                    sortOrder === "asc" ? styles.active : ""
                  }`}
                  onClick={() => setSortOrder("asc")}
                >
                  昇順
                </button>
              </div>
            </div>

            {/* 1画面あたりの表示件数（条件分岐で非表示制御） */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>1画面の表示件数</span>
              <div className={styles.optionGroup}>
                <button
                  className={`${styles.optionButton} ${
                    visibleCount === "auto" ? styles.active : ""
                  }`}
                  onClick={() => setVisibleCount("auto")}
                >
                  自動
                </button>

                {canShow5 && (
                  <button
                    className={`${styles.optionButton} ${
                      visibleCount === 5 ? styles.active : ""
                    }`}
                    onClick={() => setVisibleCount(5)}
                  >
                    5件
                  </button>
                )}

                {canShow10 && (
                  <button
                    className={`${styles.optionButton} ${
                      visibleCount === 10 ? styles.active : ""
                    }`}
                    onClick={() => setVisibleCount(10)}
                  >
                    10件
                  </button>
                )}

                <button
                  className={`${styles.optionButton} ${
                    visibleCount === "all" ? styles.active : ""
                  }`}
                  onClick={() => setVisibleCount("all")}
                >
                  全件
                </button>
              </div>
            </div>

            {/* 表示向き */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>表示向き</span>
              <div className={styles.optionGroup}>
                <button
                  className={`${styles.optionButton} ${
                    orientation === "vertical" ? styles.active : ""
                  }`}
                  onClick={() => setOrientation("vertical")}
                >
                  縦グラフ
                </button>
                <button
                  className={`${styles.optionButton} ${
                    orientation === "horizontal" ? styles.active : ""
                  }`}
                  onClick={() => setOrientation("horizontal")}
                >
                  横グラフ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}