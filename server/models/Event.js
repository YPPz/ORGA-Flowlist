import db from "../config/db.js";

const Event = {
  getEventsByUserId: (userId) => new Promise((resolve, reject) => {
    const query = `SELECT e.*, c.name AS category_name FROM events e LEFT JOIN categories c ON e.category_id=c.category_id WHERE e.user_id=?`;
    db.query(query, [userId], (err, results) => err ? reject(err) : resolve(results));
  }),

  getEventById: (id) => new Promise((resolve, reject) => {
    const query = `SELECT e.*, c.name AS category_name FROM events e LEFT JOIN categories c ON e.category_id=c.category_id WHERE e.event_id=?`;
    db.query(query, [id], (err, results) => err ? reject(err) : resolve(results[0]));
  }),

  createEvent: (data) => new Promise((resolve, reject) => {
    const { title, details, start_time, end_time, priority, user_id, category_id } = data;
    const query = `INSERT INTO events (title, details, start_time, end_time, priority, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [title, details, start_time, end_time, priority, user_id, category_id||null], (err, result) => {
      if (err) return reject(err);
      db.query(`SELECT e.*, c.name AS category_name FROM events e LEFT JOIN categories c ON e.category_id=c.category_id WHERE e.event_id=?`, [result.insertId], (err2, rows) => err2 ? reject(err2) : resolve(rows[0]));
    });
  }),

  updateEvent: (id, data) => new Promise((resolve, reject) => {
    db.query(`UPDATE events SET ? WHERE event_id=?`, [data, id], (err) => {
      if (err) return reject(err);
      db.query(`SELECT e.*, c.name AS category_name FROM events e LEFT JOIN categories c ON e.category_id=c.category_id WHERE e.event_id=?`, [id], (err2, rows) => err2 ? reject(err2) : resolve(rows[0]));
    });
  }),

  deleteEvent: (id) => new Promise((resolve, reject) => {
    db.query(`DELETE FROM events WHERE event_id=?`, [id], (err, result) => err ? reject(err) : resolve(result));
  })
};

export default Event;
