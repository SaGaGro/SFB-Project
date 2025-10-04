import { query } from '../config/database.js';

// บันทึก Activity Log
export const logActivity = async (userId, action, targetTable = null, targetId = null) => {
  try {
    const sql = `
      INSERT INTO activity_logs (user_id, action, target_table, target_id)
      VALUES (?, ?, ?, ?)
    `;
    await query(sql, [userId, action, targetTable, targetId]);
  } catch (error) {
    console.error('❌ Log Activity Error:', error.message);
  }
};

// ดึง Activity Logs
export const getActivityLogs = async (userId = null, limit = 50) => {
  try {
    let sql = `
      SELECT 
        al.*,
        u.username,
        u.email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
    `;
    
    const params = [];
    
    if (userId) {
      sql += ' WHERE al.user_id = ?';
      params.push(userId);
    }
    
    sql += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(limit);
    
    return await query(sql, params);
  } catch (error) {
    console.error('❌ Get Activity Logs Error:', error.message);
    throw error;
  }
};