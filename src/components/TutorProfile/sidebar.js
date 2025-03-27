import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useEffect } from "react";

function Sidebar({ availability }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

    useEffect(() => {// Will change this with FullCalendar later
        if (availability && selectedDate) {
            const dateStr = selectedDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
            if (availability[dateStr] && availability[dateStr].timeSlots) {
                setAvailableTimeSlots(availability[dateStr].timeSlots);
            } else {
                setAvailableTimeSlots([]);
            }
        }
    }, [availability, selectedDate]); // Update when availability or selectedDate changes

    return (
        <aside className="profile-sidebar">
            <div className="calendar">
                <h2>{selectedDate.toLocaleString("default", { month: "long" })} {selectedDate.getFullYear()}</h2>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    inline // Display calendar inline
                />
            </div>
            <div className="sessions">
                <h2>Sessions</h2>
                <ul>
                    {availableTimeSlots.map((timeSlot, index) => (
                        <li key={index}>
                            {timeSlot} - Session {index + 1}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;