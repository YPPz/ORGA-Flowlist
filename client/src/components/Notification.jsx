import { useEffect, useState } from "react";
import { getEvents } from "../api/event";
import { formatForDisplay } from "../utils/datetime";
import notification_icon from "../assets/notification.png"


export default function Notification() {
    const [open, setOpen] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const data = await getEvents(1);
                setUpcomingEvents(data);
            } catch (err) {
                console.error("Failed to load upcoming events:", err);
            }
        };

        fetchUpcoming();
    }, []);

    const remainingMinutes = (dateStr) => {
        const diffMs = new Date(dateStr) - new Date();
        return Math.floor(diffMs / (1000 * 60));
    };

    const formatRemainingTime = (dateStr) => {
        const totalMinutes = remainingMinutes(dateStr);
        if (totalMinutes <= 0) return "0 min";
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0 && minutes > 0) { return `${hours} hr. ${minutes} min`; }
        if (hours > 0) { return `${hours} hr.`; }
        return `${minutes} min`;
    }

    // Sort upcoming events in 24 hr
    const sortedEvents = [...upcomingEvents].sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );
    return (
        <div className="position-relative">
            <button
                className="btn btn-light btn-sm position-relative"
                onClick={() => setOpen((prev) => !prev)}
                type="button"
            >
                <img
                    src={notification_icon}
                    style={{ width: "1.3rem", height: "1.3rem" }}
                />
                {sortedEvents.length > 0 && (
                    <span
                        className="position-absolute start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.7rem" }}
                    >
                        {sortedEvents.length}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="shadow bg-white rounded-3 p-3 position-absolute end-0 mt-1 w-100"
                    style={{
                        minWidth: "18rem",
                        maxWidth: "90vw",
                        zIndex: 1050,
                    }}
                >
                    {sortedEvents.length === 0 ? (
                        <p className="text-center text-muted m-0">
                            No upcoming events 🎉
                        </p>
                    ) : (
                        <ul className="list-unstyled m-0">
                            {sortedEvents.map((event) => (
                                <li key={event.event_id} className="mb-2 border-bottom pb-2">
                                    <p className="mb-1 small text-muted">
                                        ⏰ Will start in {formatRemainingTime(event.start_time)}
                                    </p>
                                    <strong>{event.title}</strong>
                                    <p className="mb-0 small">
                                        {formatForDisplay(event.start_time, "en-GB")} -{" "}
                                        {formatForDisplay(event.end_time, "en-GB")}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}