import React, { useState, useRef, useMemo, useCallback } from "react";
import "./TimelineZoom.css";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const formatTickLabel = (timestamp, interval) => {
  const date = new Date(timestamp);

  if (interval >= MS_PER_DAY) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const timeString = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    const dateString = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${timeString}\n${dateString}`;
  }

  return timeString;
};

const Timeline = ({ data, totalStart, totalEnd }) => {
  const [view, setView] = useState({ start: totalStart, end: totalEnd });
  const containerRef = useRef(null);
  const panState = useRef({ isPanning: false, lastMouseX: 0 });

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const percent = mouseX / rect.width;
      const timeAtCursor = view.start + (view.end - view.start) * percent;

      const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;
      const newDuration = (view.end - view.start) * zoomFactor;

      if (
        newDuration < MS_PER_HOUR ||
        newDuration > (totalEnd - totalStart) * 2
      )
        return;

      let newStart = timeAtCursor - (timeAtCursor - view.start) * zoomFactor;
      let newEnd = newStart + newDuration;

      if (newStart < totalStart) newStart = totalStart;
      if (newEnd > totalEnd) newEnd = totalEnd;
      if (newEnd - newStart < newDuration) {
        newStart = newEnd - newDuration;
        if (newStart < totalStart) newStart = totalStart;
      }
      setView({ start: newStart, end: newEnd });
    },
    [view, totalStart, totalEnd]
  );

  const handleMouseDown = useCallback((e) => {
    panState.current = { isPanning: true, lastMouseX: e.clientX };
    containerRef.current.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!panState.current.isPanning) return;
      const deltaX = e.clientX - panState.current.lastMouseX;
      panState.current.lastMouseX = e.clientX;
      const duration = view.end - view.start;
      const timeDelta = (deltaX / containerRef.current.clientWidth) * duration;
      let newStart = view.start - timeDelta;
      let newEnd = view.end - timeDelta;

      if (newStart <= totalStart) {
        newStart = totalStart;
        newEnd = totalStart + duration;
      }
      if (newEnd >= totalEnd) {
        newEnd = totalEnd;
        newStart = totalEnd - duration;
      }
      setView({ start: newStart, end: newEnd });
    },
    [view, totalStart, totalEnd]
  );

  const handleMouseUpOrLeave = useCallback(() => {
    panState.current.isPanning = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  }, []);

  const memoizedElements = useMemo(() => {
    const viewDuration = view.end - view.start;

    let interval;
    if (viewDuration > MS_PER_DAY * 3) {
      interval = MS_PER_DAY; // 1 Day
    } else if (viewDuration > MS_PER_DAY * 1.5) {
      interval = MS_PER_HOUR * 12; // 12 Hours
    } else if (viewDuration > MS_PER_HOUR * 8) {
      interval = MS_PER_HOUR * 6; // 6 Hours
    } else if (viewDuration > MS_PER_HOUR * 4) {
      interval = MS_PER_HOUR * 3; // 3 Hours
    } else {
      interval = MS_PER_HOUR; // 1 Hour
    }

    const ticks = [];
    const start = Math.floor(view.start / interval) * interval;
    for (let time = start; time <= view.end; time += interval) {
      if (time >= view.start) {
        ticks.push({
          timestamp: time,
          label: formatTickLabel(time, interval),
        });
      }
    }

    const dataLines = data
      .filter((item) => item.end >= view.start && item.start <= view.end)
      .map((item, index) => {
        const left = ((item.start - view.start) / viewDuration) * 100;
        return (
          <div
            key={index}
            className="timeline-data-vline"
            style={{ left: `${left}%` }}
          />
        );
      });

    const dataEnd =
      data.length > 0 ? Math.max(...data.map((d) => d.end)) : view.end;
    const capLeft = ((dataEnd - view.start) / viewDuration) * 100;
    const capWidth = ((view.end - dataEnd) / viewDuration) * 100;
    const endCap =
      capLeft < 100 ? (
        <div
          className="timeline-end-cap"
          style={{ left: `${capLeft}%`, width: `${capWidth}%` }}
        />
      ) : null;

    return { ticks, dataLines, endCap };
  }, [view, data]);

  return (
    <div
      className="timeline-container"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      <div className="timeline-ruler">
        {memoizedElements.ticks.map(({ timestamp, label }) => {
          const percent =
            ((timestamp - view.start) / (view.end - view.start)) * 100;
          return (
            <div
              key={timestamp}
              className="timeline-tick"
              style={{ left: `${percent}%` }}
            >
              <div className="tick-line" />
              <div className="tick-label">{label}</div>
            </div>
          );
        })}
      </div>
      <div className="timeline-data-area">
        {memoizedElements.dataLines}
        {memoizedElements.endCap}
      </div>
    </div>
  );
};

export default Timeline;
