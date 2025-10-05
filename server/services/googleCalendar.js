import { google } from 'googleapis';

// สร้าง OAuth2 client จาก access token ของ user
export function getCalendarClient(accessToken) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth: oAuth2Client });
}

// List events
export async function listEvents(accessToken, maxResults = 10) {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });
  return res.data.items;
}

// Get event for partial field update
 export async function getEvent(accessToken, eventId) {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.events.get({
    calendarId: 'primary',
    eventId,
  });
  return res.data;
}


//Create event
export async function createEvent(accessToken, event) {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  return res.data;
}

//Update event
export async function updateEvent(accessToken, eventId, event) {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: event,
  });
  return res.data;
}

//Delete event
export async function deleteEvent(accessToken, eventId) {
  const calendar = getCalendarClient(accessToken);
  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
  return { success: true };
}
