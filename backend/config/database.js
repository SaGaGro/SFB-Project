import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// สร้าง connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// ทดสอบการเชื่อมต่อ
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');
    connection.release();
  } catch (error) {
    console.error('❌ เชื่อมต่อฐานข้อมูลไม่สำเร็จ:', error.message);
    process.exit(1);
  }
};

// Query แบบง่าย
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.error('Query Error:', err.message);
    throw err;
  }
};


// Transaction helper - สำหรับทำงานหลายอย่างพร้อมกัน
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export { testConnection, query, transaction };
export default pool;