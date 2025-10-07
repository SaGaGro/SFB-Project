import generatePayload from 'promptpay-qr';
import qrcode from 'qrcode';

export const generatePromptPayQR = async (phoneNumber, amount) => {
  try {
    const payload = generatePayload(phoneNumber, { amount });
    const qrCodeDataURL = await qrcode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 400,
      margin: 1,
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating PromptPay QR:', error);
    throw new Error('ไม่สามารถสร้าง QR Code ได้');
  }
};

export const validatePromptPayPhone = (phoneNumber) => {
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phoneNumber);
};

export const formatPromptPayPhone = (phoneNumber) => {
  if (!phoneNumber) {
    throw new Error('เบอร์โทรไม่ถูกต้อง');
  }

  // ลบช่องว่างและขีดกลาง
  let formatted = phoneNumber.replace(/[\s-]/g, '');

  // เปลี่ยน +66 เป็น 0
  if (formatted.startsWith('+66')) {
    formatted = '0' + formatted.substring(3);
  }

  return formatted;
};
