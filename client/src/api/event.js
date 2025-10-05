const API_URL = import.meta.env.VITE_API_URL;

// Get all events for the logged-in user
export const getEvents = async (days) => {
  const url = days
    ? `${API_URL}/api/calendar/events?days=${days}`
    : `${API_URL}/api/calendar/events`;

  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch events");

  const result = await res.json();
  return result.data; 
};

// export const getEvents = async () => {
//   const res = await fetch(`${API_URL}/api/calendar/events`, {
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error("Failed to fetch events");
//   return res.json();
// };

// Create a new event
export const createEvent = async (eventData) => {
  const res = await fetch(`${API_URL}/api/calendar/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
};

// Update an existing event
export const updateEvent = async (id, eventData) => {
  const res = await fetch(`${API_URL}/api/calendar/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
};

// Delete an event
export const deleteEvent = async (id) => {
  const res = await fetch(`${API_URL}/api/calendar/events/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
};
