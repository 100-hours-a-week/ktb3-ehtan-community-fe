import { useLayoutEffect, useMemo, useRef, useState } from "react";

const DEFAULT_WIDTH = 330;
const DEFAULT_GUTTER = 10;

export function useMasonryColumns(items, options = {}) {
  const cardWidth = options.columnWidth ?? DEFAULT_WIDTH;
  const gutter = options.gutter ?? DEFAULT_GUTTER;
  const containerRef = useRef(null);
  const [columnCount, setColumnCount] = useState(1);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const el = containerRef.current;
    if (!el) return undefined;

    const compute = (width) => {
      const containerWidth = width || el.clientWidth || cardWidth;
      const count = Math.max(
        1,
        Math.floor((containerWidth + gutter) / (cardWidth + gutter))
      );
      setColumnCount(count);
    };

    compute();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || entries.length === 0) return;
      const entry = entries[0];
      const width = entry.contentRect?.width;
      compute(width);
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [cardWidth, gutter]);

  const columns = useMemo(() => {
    return Array.from({ length: columnCount }, (_, index) => {
      const columnItems = [];
      for (let i = index; i < items.length; i += columnCount) {
        columnItems.push(items[i]);
      }
      return columnItems;
    });
  }, [columnCount, items]);

  return { containerRef, columns, columnCount };
}
