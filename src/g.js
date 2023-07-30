import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState("UTC-5");
  const [eventsData, setEventsData] = useState([]);

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

  const daysOfWeek = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri","Sat"];

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

  const handleCheckboxClick = (dayIndex, slotIndex) => {
    // Get the selected date and time from the calendar
    const selectedDate = new Date(currentDate);
    selectedDate.setDate(selectedDate.getDate() + dayIndex);
    const selectedTime = timeSlots[slotIndex];

    // Create a new event object with the relevant data
    const newEvent = {
      id: `${selectedDate.toDateString()} at ${selectedTime}`.split(' ').join(''), // Assign a unique ID to the new event
      date: selectedDate.toISOString().slice(0, 10),
      time: selectedTime,
      text: `Event${dayIndex} for ${selectedDate.toDateString()} at ${selectedTime}`,
    };

    // Update the eventsData state by adding the new event
    setEventsData((prevEvents) => [...prevEvents, newEvent]);

    // Send a POST request to add the new event data to the JSON server
    fetch("http://localhost:3001/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("New event added:", data);
      })
      .catch((error) => {
        console.error("Error adding new event:", error);
      });
  };

  // Fetch events data from the JSON file on component mount
  useEffect(() => {
    fetch("http://localhost:3001/data")
      .then((response) => response.json())
      .then((data) => {
        setEventsData(data);
      })
      .catch((error) => {
        console.error("Error fetching events data:", error);
      });
  }, []);

  // Filter out past events from the displayed events
  const filteredEventsData = eventsData.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= new Date().setHours(0, 0, 0, 0);
  });

  return (
    <div className="app">
      <div className="navigation">
        <button onClick={handlePreviousWeek}>&lt; Previous Week</button>
        <span>{new Date().toDateString()}</span>
        <button onClick={handleNextWeek}>Next Week &gt;</button>
      </div>
      <div className="timezone">
        <label htmlFor="timezone">Timezone</label>
        <select id="timezone" value={selectedTimezone} onChange={handleTimezoneChange}>
          <option value="UTC-5">[UTC-5] Eastern Time Zone</option>
          <option value="UTC+0">[UTC+0] Greenwich Mean Time</option>
          {/* Add more timezone options here if needed */}
        </select>
      </div>
      <div className="calendar">
        {daysOfWeek.map((day, dayIndex) => (
          currentDate.getDay()===0?"":
          <div key={day}>
            <div className={`day-name ${isPastDay(dayIndex) ? "past-day" : ""}`}>
              {day} <br />
              <p>
                {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex ).toLocaleDateString()}
              </p>
            </div>
            {isPastDay(dayIndex) ?(<p className="passed-date">Past</p>): (
              <div className="time-slots">
                {timeSlots.map((timeSlot, slotIndex) => {
                  const selectedDate = new Date(currentDate);
                  selectedDate.setDate(selectedDate.getDate() + dayIndex);
                  const selectedTime = timeSlots[slotIndex];
                  const eventId = `${selectedDate.toISOString().slice(0, 10)} at ${selectedTime}`;
                  const isChecked = eventsData.some((event) => event.date === selectedDate.toISOString().slice(0, 10) && event.time === selectedTime);

                  return (
                    <label key={timeSlot}>
                      <input
                        type="checkbox"
                        id={`day${dayIndex}-slot${slotIndex}`}
                        name={`day${dayIndex}-slot${slotIndex}`}
                        checked={isChecked}
                        onChange={() => handleCheckboxClick(dayIndex, slotIndex)}
                      />
                      {isPastDay(dayIndex) ? "Past" : timeSlot}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
