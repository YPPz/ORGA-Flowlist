import mysql from 'mysql2';

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 21772
});
try {
  db.connect();
  console.log('✅ Connected ORGA_Flowlist_RailwayDB successfully!');
} catch (err) {
  console.error('❌ MySQL connection failed:', err);
}

export default db;
