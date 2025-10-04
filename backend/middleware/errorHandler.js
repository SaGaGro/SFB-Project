// Global Error Handler
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  // MySQL Errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลซ้ำในระบบ'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลอ้างอิงไม่ถูกต้อง'
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token หมดอายุ'
    });
  }

  // Default Error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'เกิดข้อผิดพลาดในระบบ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 Handler
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'ไม่พบ API ที่ต้องการ'
  });
};