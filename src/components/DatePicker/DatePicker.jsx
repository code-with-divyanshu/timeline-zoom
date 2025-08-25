import React, { useState, useCallback } from "react";
import "./DatePicker.css";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DatePicker = ({ onRangeSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [selecting, setSelecting] = useState("from");

  const changeMonth = useCallback((offset) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  }, []);

  const handleDayClick = useCallback(
    (day) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      if (selecting === "from" || date < from) {
        setFrom(date);
        setTo(null);
        setSelecting("to");
      } else {
        setTo(date);
        setSelecting("from");
        onRangeSelect({ from, to: date });
      }
    },
    [currentMonth, from, selecting, onRangeSelect]
  );

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...blanks, ...days].map((day, index) => {
      if (!day)
        return (
          <div key={`blank-${index}`} className="calendar-day empty"></div>
        );

      const date = new Date(year, month, day);
      const isSelected =
        (from && date.getTime() === from.getTime()) ||
        (to && date.getTime() === to.getTime());
      const isInRange = from && to && date > from && date < to;

      let className = "calendar-day";
      if (isSelected) className += " selected";
      if (isInRange) className += " in-range";
      if (selecting === "to" && from && date.getTime() === from.getTime())
        className += " start-node";

      return (
        <div
          key={day}
          className={className}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </div>
      );
    });
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}>‹</button>
        <span>
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button onClick={() => changeMonth(1)}>›</button>
      </div>
      <div className="calendar-grid">
        <div className="calendar-day-name">Sun</div>
        <div className="calendar-day-name">Mon</div>
        <div className="calendar-day-name">Tue</div>
        <div className="calendar-day-name">Wed</div>
        <div className="calendar-day-name">Thu</div>
        <div className="calendar-day-name">Fri</div>
        <div className="calendar-day-name">Sat</div>
        {renderCalendar()}
      </div>
      <div className="calendar-info">
        <span>From: {from ? from.toLocaleDateString() : "..."}</span>
        <span>To: {to ? to.toLocaleDateString() : "..."}</span>
      </div>
    </div>
  );
};

export default DatePicker;
