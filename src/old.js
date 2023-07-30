// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import eventsData from "./Data/eventsData.json";

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState("[UTC-5] Eastern Time Zone");
  const [events, setEvents] = useState([]);

  const handlePreviousWeek = () => {
    setCurrentDate((prevDate) => {
      const prevWeek = new Date(prevDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      return prevWeek;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prevDate) => {
      const nextWeek = new Date(prevDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    });
  };

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
  };

  const getDayIndex = (date) => {
    const dayIndex = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    return dayIndex === 0 ? 6 : dayIndex - 1; // Adjust the index to start from Monday (0 for Mon, 1 for Tue, etc.)
  };

  useEffect(() => {
    // Load events from the JSON file and convert event times to the selected timezone
    const loadedEvents = eventsData.map((event) => {
      const eventDate = new Date(event.Date);
      const selectedTimezoneOffset = parseInt(selectedTimezone.split("UTC")[1]) * 60 * 60 * 1000;
      eventDate.setTime(eventDate.getTime() + selectedTimezoneOffset);
      return { ...event, Date: eventDate };
    });

    setEvents(loadedEvents);
  }, [selectedTimezone]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const timeSlots = Array.from({ length: 31 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });

  const isPastDay = (dayIndex) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the date for the selected day in the current week
    const selectedDate = new Date(currentDate);
    selectedDate.setDate(selectedDate.getDate() + dayIndex);

    // If the selectedDate is before today's date and not equal to today's date, it means the day is in the past.
    return selectedDate < today && !isSameDate(selectedDate, today);
  };

  const isSameDate = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <div className="app">
      <div className="navigation">
        <button onClick={handlePreviousWeek}>&lt; Previous Week</button>
        <span>{currentDate.toDateString()}</span>
        <button onClick={handleNextWeek}>Next Week &gt;</button>
      </div>
      <div className="timezone">
        <label htmlFor="timezone">Timezone</label>
        <select id="timezone" value={selectedTimezone} onChange={handleTimezoneChange}>
          <option value="[UTC-5] Eastern Time Zone">[UTC-5] Eastern Time Zone</option>
          <option value="[UTC+0] Greenwich Mean Time">[UTC+0] Greenwich Mean Time</option>
          {/* Add more timezone options here if needed */}
        </select>
      </div>
      <div className="calendar">
       
        {daysOfWeek.map((day, index) => (
          <div key={day}>
            <div className={`day-name ${isPastDay(index) ? "past-day" : ""}`}>
              {day} <br />
            <p>{currentDate.getDate() + index + 1}</p>  

            </div>
            {isPastDay(index) ? (
              <div className="past-days">Past</div>
            ) : (
              <div className="time-slots">
                {timeSlots.map((timeSlot, slotIndex) => (
                  <label key={timeSlot}>
                    <input
                      type="checkbox"
                      id={`day${index}-slot${slotIndex}`}
                      name={`day${index}-slot${slotIndex}`}
                    />
                    {timeSlot}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

















// WeeklyCalendar.js
import React, { useState } from 'react';
import './WeeklyCalender.css'; // Import the CSS file

const WeeklyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('UTC-0');

  // Function to move weeks backward or forward
  const moveWeeks = (weeks) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + weeks * 7);
    setCurrentDate(newDate);
  };

  // Function to handle timezone selection change
  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
  };

  // Function to get an array of weekdays (from Monday to Friday) for the selected week
  const getWeekdays = () => {
    const weekdays = [];
    const date = new Date(currentDate);
    for (let i = 1; i <= 5; i++) {
      date.setDate(date.getDate() + (i === 1 ? 0 : 1));
      weekdays.push(new Date(date));
    }
    return weekdays;
  };

  // Function to get an array of time slots (from 8 AM to 11 PM) with 30-minute intervals
  const getTimeSlots = () => {
    const timeSlots = [];
    const startTime = new Date('1970-01-01T08:00:00Z');
    const endTime = new Date('1970-01-02T00:00:00Z');
    const step = 30 * 60 * 1000; // 30 minutes in milliseconds

    while (startTime < endTime) {
      timeSlots.push(new Date(startTime));
      startTime.setTime(startTime.getTime() + step);
    }

    return timeSlots;
  };

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <button onClick={() => moveWeeks(-1)}>Previous Week</button>
        <span>{currentDate.toDateString()}</span>
        <button onClick={() => moveWeeks(1)}>Next Week</button>
      </div>
      <div className="timezone-select">
        <label htmlFor="timezone">Timezone:</label>
        <select id="timezone" value={selectedTimezone} onChange={handleTimezoneChange}>
          <option value="UTC-0">UTC-0</option>
          <option value="UTC+5">UTC+5</option>
        </select>
      </div>
      <div className="calendar-body">
        {/* Render checkboxes for working days and times */}
        {getWeekdays().map((day) => (
          <div className="weekday-row" key={day.toDateString()}>
            <span className="weekday">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <div className="timeslot-row">
              {getTimeSlots().map((slot) => (
                <div className="timeslot" key={slot.toISOString()}>
                  <input type="checkbox" id={slot.toISOString()} />
                  <label htmlFor={slot.toISOString()}>
                    {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
