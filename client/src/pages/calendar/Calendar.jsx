import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import { getEvents, updateEvent } from "../../api/event";
import { useEvents } from "../../contexts/EventContext";
import EventCard from "../../components/EventCard";
import CreateEventButton from "../../components/CreateEventButton";
import { formatForDB, formatTimeHHmm } from "../../utils/datetime";
import "./Calendar.css";

export default function CalendarPage() {
    const { events, setEvents } = useEvents();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const data = await getEvents();
                setEvents(data);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [setEvents]);

    const formattedEvents = events.map((ev) => ({
        id: ev.event_id,
        title: ev.title,
        start: ev.start_time,
        end: ev.end_time,
        allDay: ev.all_day || false,
        extendedProps: {
            details: ev.details || "",
            priority: ev.priority || null,
            category_id: ev.category_id,
            category_name: ev.category_name || "",
            user_id: ev.user_id,
            htmlLink: ev.htmlLink || "",
            event_id: ev.event_id,
        },
    }));

    const handleEventChange = async (changeInfo) => {
        try {
            const { id } = changeInfo.event;
            const formattedStart = formatForDB(changeInfo.event.start);
            const formattedEnd = formatForDB(changeInfo.event.end);

            const oldEvent = events.find((e) => String(e.event_id) === String(id));
            if (!oldEvent) {
                console.warn("Event not found in state:", id);
                return;
            }

            const updatedData = {
                title: oldEvent.title,
                details: oldEvent.details || null,
                start_time: formattedStart,
                end_time: formattedEnd,
                priority: oldEvent.priority || null,
                category_id: oldEvent.category_id || null,
            };

            const updatedEvent = await updateEvent(id, updatedData);

            setEvents((prev) =>
                prev.map((ev) => (String(ev.event_id) === String(id) ? updatedEvent : ev))
            );
        } catch (err) {
            console.error("Error updating event:", err);
        }
    };

    const handleEventClick = (clickInfo) => {
        const eventData = {
            event_id: clickInfo.event.id,
            title: clickInfo.event.title,
            start_time: clickInfo.event.start?.toISOString(),
            end_time: clickInfo.event.end?.toISOString(),
            details: clickInfo.event.extendedProps.details,
            priority: clickInfo.event.extendedProps.priority,
            category_id: clickInfo.event.extendedProps.category_id,
            category_name: clickInfo.event.extendedProps.category_name,
            user_id: clickInfo.event.extendedProps.user_id,
        };
        setSelectedEvent(eventData);
    };

    if (error) {
        return (
            <div className="calendar-container">
                <p className="fs-5 text-danger">{error}</p>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="fs-5 text-muted">Loading events...</p>
                </div>
            ) : (
                <div className="calendar-wrapper">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                        initialView="dayGridMonth"
                        editable={true}
                        events={formattedEvents}
                        eventChange={handleEventChange}
                        eventClick={handleEventClick}
                        eventDrop={handleEventChange}
                        eventResize={handleEventChange}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        height="75vh"
                        eventDisplay="auto"
                        eventContent={(arg) => {
                            const isMonthView = arg.view.type === "dayGridMonth";
                            const startTime =
                                isMonthView && arg.event.startStr ? formatTimeHHmm(arg.event.startStr) : "";
                            const title = arg.event?.title;
                            return (
                                <div className="fc-event-custom">
                                    {isMonthView ? `${startTime} ${title}` : title}
                                </div>
                            );
                        }}
                    />

                    <div className="position-absolute  bottom-0 end-0 pe-3 pb-3 z-3" >
                        <CreateEventButton className="create-event-btn" label="+" />
                    </div>

                </div>
            )}
            {/* popup overlay */}
            {selectedEvent && (
                <div
                    className="calendar-popup-overlay d-flex justify-content-center align-items-center"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="calendar-popup-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EventCard
                            event={selectedEvent}
                            onDelete={(id) => {
                                setEvents((prev) =>
                                    prev.filter((e) => String(e.event_id) !== String(id))
                                );
                                setSelectedEvent(null);
                            }}
                            onUpdate={(updated) => {
                                setEvents((prev) =>
                                    prev.map((e) =>
                                        String(e.event_id) === String(updated.event_id) ? updated : e
                                    )
                                );
                                setSelectedEvent(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
