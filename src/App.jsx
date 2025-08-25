import React, { useState, useMemo } from "react";
import DatePicker from "./components/DatePicker/DatePicker";
import Timeline from "./components/TimelineZoom/TimelineZoom";
import "./App.css";

const generateTimelineData = (start, end) => {
  if (!start || !end) return [];

  const data = [];
  const range = end.getTime() - start.getTime();
  const eventCount = (range / (1000 * 60 * 60 * 24)) * 500;

  for (let i = 0; i < eventCount; i++) {
    const eventStart = start.getTime() + Math.random() * range;
    const duration = (Math.random() * 5 + 1) * 60 * 1000;
    data.push({ start: eventStart, end: eventStart + duration });
  }
  return data;
};

function App() {
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const handleDateRangeSelect = (range) => {
    if (range.from) range.from.setHours(0, 0, 0, 0);
    if (range.to) range.to.setHours(23, 59, 59, 999);
    setDateRange(range);
  };

  const timelineData = useMemo(
    () => generateTimelineData(dateRange.from, dateRange.to),
    [dateRange]
  );

  return (
    <div className="app-container">
      <h1>High-Fidelity Interactive Timeline</h1>

      <div className="picker-container">
        <DatePicker onRangeSelect={handleDateRangeSelect} />
      </div>

      <div className="timeline-section">
        {dateRange.from && dateRange.to ? (
          <Timeline
            data={timelineData}
            totalStart={dateRange.from.getTime()}
            totalEnd={dateRange.to.getTime()}
          />
        ) : (
          <div className="timeline-placeholder">
            Please select a date range to display the timeline.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
