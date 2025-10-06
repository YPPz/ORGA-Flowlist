import * as googleCalendar from '../services/googleCalendar.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Category from '../models/Category.js';
import dayjs from 'dayjs';

const googleToApp = (googleEvent, user_id) => ({
  event_id: googleEvent.id,
  title: googleEvent.summary || "",
  details: googleEvent.description || "",
  start_time: googleEvent.start?.dateTime || googleEvent.start?.date || "",
  end_time: googleEvent.end?.dateTime || googleEvent.end?.date || "",
  priority: null,
  user_id: user_id,
  category_id: null,
  category_name: "",
  htmlLink: googleEvent.htmlLink || "",
  created_at: googleEvent.created || null,
  updated_at: googleEvent.updated || null,
});

const appToGoogle = (data, existingGoogleEvent = {}) => {
  const updatedEvent = {};

  if (data.title !== undefined) updatedEvent.summary = data.title;
  if (data.details !== undefined) updatedEvent.description = data.details;

  if (data.start_time !== undefined) {
    updatedEvent.start = { dateTime: dayjs(data.start_time).toISOString(), timeZone: "Asia/Bangkok" };
  } else if (existingGoogleEvent.start) {
    updatedEvent.start = existingGoogleEvent.start;
  }

  if (data.end_time !== undefined) {
    updatedEvent.end = { dateTime: dayjs(data.end_time).toISOString(), timeZone: "Asia/Bangkok" };
  } else if (existingGoogleEvent.end) {
    updatedEvent.end = existingGoogleEvent.end;
  }

  return updatedEvent;
};

/**
 * Helper functions: differentiate between Google login || other logins
 */

export const listEventsRaw = async (user, googleAccessToken) => {
  console.log(user, googleAccessToken)
  try {
    if (user.provider === 'google' && googleAccessToken) {
      const googleEvents = await googleCalendar.listEvents(googleAccessToken);
      return googleEvents.map(e => googleToApp(e, user.user_id));
    }
    return await Event.getEventsByUserId(user.user_id);
  } catch (err) {
    console.error("Error in listEventsRaw:", err);
    throw new Error("Failed to list events");
  }
};

export const createEventRaw = async (user, data, googleAccessToken) => {
  try {
    let start = data.start_time ? new Date(data.start_time) : null;
    let end = data.end_time ? new Date(data.end_time) : null;
    if (start && !end) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
      data.end_time = end;
    }

    if (user.provider === 'google' && googleAccessToken) {
      const googleEventData = appToGoogle(data);
      const createdEvent = await googleCalendar.createEvent(googleAccessToken, googleEventData);
      return googleToApp(createdEvent, user.user_id);
    }

    // 🟢 Local DB: transform format before use

    const dbEventData = {
      ...data,
      start_time: dayjs(start).format("YYYY-MM-DD HH:mm:ss"),
      end_time: dayjs(end).format("YYYY-MM-DD HH:mm:ss"),
      user_id: user.user_id,
    };

    return await Event.createEvent(dbEventData);

  } catch (err) {
    console.error("Error in createEventRaw:", err);
    throw new Error("Failed to create event");
  }
};

export const updateEventRaw = async (user, eventId, data, googleAccessToken) => {
  try {
    if (user.provider === 'google' && googleAccessToken) {
      const existingGoogleEvent = await googleCalendar.getEvent(googleAccessToken, eventId);
      const googleEventData = appToGoogle(data, existingGoogleEvent);
      const updatedEvent = await googleCalendar.updateEvent(googleAccessToken, eventId, googleEventData);
      return googleToApp(updatedEvent, user.user_id);
    }

    const event = await Event.getEventById(eventId);
    if (!event) throw new Error('Event not found');
    if (event.user_id !== user.user_id) throw new Error('Not authorized');
    return await Event.updateEvent(eventId, data);

  } catch (err) {
    console.error("Error in updateEventRaw:", err);
    throw new Error(err.message || "Failed to update event");
  }
};

export const deleteEventRaw = async (user, eventId, googleAccessToken) => {
  try {
    if (user.provider === 'google' && googleAccessToken) {
      await googleCalendar.deleteEvent(googleAccessToken, eventId);
      return { success: true };
    }
    const event = await Event.getEventById(eventId);
    if (!event) throw new Error('Event not found');
    if (event.user_id !== user.user_id) throw new Error('Not authorized');
    await Event.deleteEvent(eventId);
    return { success: true };

  } catch (err) {
    console.error("Error in deleteEventRaw:", err);
    throw new Error(err.message || "Failed to delete event");
  }
};


/**
 * Controller functions for routes
 */
export const listEvents = async (req, res) => {
  try {
    const [user] = await User.getUserById(req.user.user_id);
    const { days } = req.query;

    let events = await listEventsRaw(user, req.googleAccessToken);

    if (days) {
      const now = dayjs();
      const limit = now.add(Number(days), 'day');
      events = events.filter(event => {
        const start = dayjs(event.start_time);
        return start.isAfter(now) && start.isBefore(limit);
      });
    }

    res.json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list events', error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.getEventById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const [user] = await User.getUserById(req.user.user_id);
    const { title, details, start_time, end_time, priority, category_id, newCategoryName } = req.body;

    if (!title || !start_time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let finalCategoryId = category_id || null;
    if (newCategoryName) {
      const newCategory = await Category.createCategory({ name: newCategoryName, user_id: user.user_id });
      finalCategoryId = newCategory.category_id;
    }

    const eventData = {
      title,
      details,
      start_time,
      end_time,
      priority: priority || null,
      category_id: finalCategoryId || null
    };

    const event = await createEventRaw(user, eventData, req.googleAccessToken);
    res.status(201).json(event);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create event', error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const [user] = await User.getUserById(req.user.user_id);
    const { id } = req.params;
    const eventData = req.body;

    const updated = await updateEventRaw(user, id, eventData, req.googleAccessToken);
    res.json(updated);

  } catch (err) {
    console.error(err);
    if (err.message === 'Event not found') return res.status(404).json({ message: err.message });
    if (err.message === 'Not authorized') return res.status(403).json({ message: err.message });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const [user] = await User.getUserById(req.user.user_id);
    const { id } = req.params;

    const result = await deleteEventRaw(user, id, req.googleAccessToken);
    res.json(result);

  } catch (err) {
    console.error(err);
    if (err.message === 'Event not found') return res.status(404).json({ message: err.message });
    if (err.message === 'Not authorized') return res.status(403).json({ message: err.message });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
