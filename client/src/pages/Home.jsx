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
                console.log(data)
                setEvents(data);
            } catch (err) {
                setError("Failed to load events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [setEvents]);

    // Events in the next 7 days
    const upcomingEvents = events.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    console.log("upcoming >> ", upcomingEvents)


    if (error) {
        return (
            <div className="h-100 flex-grow-1 d-flex justify-content-center align-items-center">
                <p className="fs-5 text-danger">{error}</p>
            </div>
        );
    };

    return (
        <div className="d-flex flex-column h-100">
            {loading ? (
                <div className="flex-grow-1 d-flex justify-content-center align-items-center" >
                    <p className="fs-5 text-muted text-center">Loading events...</p>
                </div>
            ) :
                events.length > 0 ? (
                    <div className="d-flex flex-column align-items-center">
                        <div className="w-75 d-flex justify-content-between align-items-center">
                            <h3 className="text-start my-4 fw-bold">Upcoming...</h3>
                            <Notification />
                        </div>

                        {upcomingEvents.map((event) => (
                            <div key={event.event_id} className="my-3 w-50">
                                <EventCard
                                    event={event}
                                    onDelete={(id) => setEvents((prev) => prev.filter((e) => e.event_id !== id))}
                                    onUpdate={(updated) => setEvents((prev) => prev.map((e) => e.event_id === updated.event_id ? updated : e))}
                                />
                            </div>
                        ))}
                        <div className="my-4">
                            <CreateEventButton userId={user.user_id} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                        <p className="my-3 fs-5 text-muted">
                            Nothing on your list. Time to relax ✨
                        </p>
                        <CreateEventButton userId={user.user_id} />
                    </div>
                )}
        </div>
    );
}
