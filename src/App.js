// Import React and necessary hooks
import React, { useState, useEffect } from "react";

// Import CSS file for styling (if needed)
import "./App.css";

const App = () => {
  // State variables to store the current date, selected timezone, and events data
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState("UTC+0");
  const [eventsData, setEventsData] = useState([]);

  // Function to handle clicking the "Previous Week" button
  const handlePreviousWeek = () => {
    setCurrentDate((prevDate) => {
      // Create a new Date object from the previous date
      const prevWeek = new Date(prevDate);
      // Subtract 7 days to go back to the previous week
      prevWeek.setDate(prevWeek.getDate() - 7);
      return prevWeek;
    });
  };

  // Function to handle clicking the "Next Week" button
  const handleNextWeek = () => {
    setCurrentDate((prevDate) => {
      // Create a new Date object from the previous date
      const nextWeek = new Date(prevDate);
      // Add 7 days to go to the next week
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    });
  };

  // Function to handle changing the timezone selection
  const handleTimezoneChange = (e) => {
    // Update the selectedTimezone state with the new value
    setSelectedTimezone(e.target.value);
  };

  // Array to store the days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Function to determine the time slots based on the selected timezone
  const getTimeSlots = () => {
    if (selectedTimezone === "UTC+0") {
      // If UTC+0 is selected, time slots start from 8:00 AM and increase by 30 minutes
      return Array.from({ length: 31 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8;
        const minute = i % 2 === 0 ? "00" : "30";
        return `${hour}:${minute}`;
      });
    } else {
      // If UTC-5 is selected, time slots start from 1:00 PM and increase by 30 minutes
      return Array.from({ length: 31 }, (_, i) => {
        const hour = Math.floor(i / 2) + 13;
        const minute = i % 2 === 0 ? "00" : "30";
        return `${hour}:${minute}`;
      });
    }
  };

  // Function to check if a day is in the past
  const isPastDay = (dayIndex) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the date for the selected day in the current week
    const selectedDate = new Date(currentDate);
    selectedDate.setDate(selectedDate.getDate() + dayIndex);

    // If the selectedDate is before today's date and not equal to today's date, it means the day is in the past.
    return selectedDate < today && !isSameDate(selectedDate, today);
  };

  // Function to check if two dates are the same
  const isSameDate = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Function to handle clicking on a time slot checkbox
  const handleCheckboxClick = (dayIndex, slotIndex) => {
    // Get the selected date and time from the calendar
    const selectedDate = new Date(currentDate);
    selectedDate.setDate(selectedDate.getDate() + dayIndex);
    const selectedTime = timeSlots[slotIndex];

    // Create a new event object with the relevant data
    const newEvent = {
      id: `${selectedDate.toDateString()} at ${selectedTime}`.split(" ").join(""), // Assign a unique ID to the new event
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

  // Effect hook to fetch events data from the JSON file on component mount
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

  // Get the time slots based on the selected timezone
  const timeSlots = getTimeSlots();

  // Render the calendar UI
  return (
    <div className="app">
      <div className="navigation">
        <div className="di">
        <button onClick={handlePreviousWeek}>&lt; Previous Week</button>
        <span style={{marginLeft:'30px'}}>{new Date().toDateString()}</span>
        </div>
        <button onClick={handleNextWeek}>Next Week &gt;</button>
      </div>
      <div className="timezone">
        <label htmlFor="timezone">Timezone</label>
        <select id="timezone" value={selectedTimezone} onChange={handleTimezoneChange}>
          <option value="UTC+0">[UTC+0] Greenwich Mean Time</option>
          <option value="UTC-5">[UTC-5] Eastern Time Zone</option>
          {/* Add more timezone options here if needed */}
        </select>
      </div>
      <div className="calendar">
        {daysOfWeek.map((day, dayIndex) => (
          dayIndex === 0 || dayIndex === 6 ? null : ( // Do not show events for Sundays and Saturdays
            <div key={day}>
              <div className={`day-name ${isPastDay(dayIndex) ? "past-day" : ""}`}>
                {day} <br />
                <p>
                  {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex + 1).toLocaleDateString()}
                </p>
              </div>
              {isPastDay(dayIndex) ? (<p className="passed-date">Past</p>) : (
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
          )
        ))}
      </div>
    </div>
  );
};

export default App;
