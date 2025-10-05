export const formatForDB = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const formatForDisplay = (dateStr, locale = "th-TH") => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const formatForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
};

export const formatTimeHHmm = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}.${pad(d.getMinutes())}`;
};
