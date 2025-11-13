"use client";

import { useEffect, useRef, useState } from "react";

interface VirtualScrollerProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualScroller({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = "",
}: VirtualScrollerProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const visibleItems = items.slice(startIndex, Math.min(endIndex + 1, items.length));
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer before visible items */}
      <div style={{ height: offsetY }} />

      {/* Visible items */}
      {visibleItems.map((item, i) => (
        <div key={startIndex + i}>{renderItem(item, startIndex + i)}</div>
      ))}

      {/* Spacer after visible items */}
      <div style={{ height: Math.max(0, (items.length - endIndex - 1) * itemHeight) }} />
    </div>
  );
}

