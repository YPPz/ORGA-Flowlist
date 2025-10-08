import { useEffect, useState, useContext } from "react";
import EventCard from "../components/EventCard";
import CreateEventButton from "../components/CreateEventButton";
import { getEvents } from "../api/event";
import UserContext from "../contexts/UserContext";
import { useEvents } from "../contexts/EventContext";
import Notification from "../components/Notification";

export default function Home() {
    const { user } = useContext(UserContext);
    const { events, setEvents } = useEvents();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents(7);
                setEvents(data);
            } catch (err) {
                setError("Failed to load events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [setEvents]);

    const upcomingEvents = events.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    if (error) {
        return (
            <div className="h-100 flex-grow-1 d-flex justify-content-center align-items-center">
                <p className="fs-5 text-danger">{error}</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                    <p className="fs-5 text-muted text-center">Loading events...</p>
                </div>
            ) : events.length > 0 ? (
                <>
                    <div className="d-flex flex-row justify-content-between align-items-start mb-4 mx-2">
                        <h3 className="fw-bold mb-3 mb-md-0">Upcoming...</h3>
                        <Notification />
                    </div>

                    <div className="row g-3 justify-content-center">
                        {upcomingEvents.map((event) => (
                            <div key={event.event_id} className="col-12 col-md-7">
                                <EventCard
                                    event={event}
                                    onDelete={(id) => setEvents((prev) => prev.filter((e) => e.event_id !== id))}
                                    onUpdate={(updated) =>
                                        setEvents((prev) =>
                                            prev.map((e) => (e.event_id === updated.event_id ? updated : e))
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-center mt-4">
                        <CreateEventButton userId={user.user_id} />
                    </div>
                </>
            ) : (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                    <p className="fs-5 text-muted mb-3 text-center">
                        Nothing on your list. Time to relax ✨
                    </p>
                    <CreateEventButton userId={user.user_id} />
                </div>
            )}
        </div>
    );
}
