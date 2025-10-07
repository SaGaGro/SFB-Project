import omise from '../config/omise.js';

export const createOmiseCharge = async (amount, description, metadata = {}) => {
  try {
    const charge = await omise.charges.create({
      amount: Math.round(amount * 100), // Convert to satang (smallest unit)
      currency: 'THB',
      capture: true,
      description: description,
      metadata: metadata,
      source: {
        type: 'promptpay',
      },
      return_uri: `${process.env.FRONTEND_URL}/payment/callback`,
    });

    return {
      success: true,
      charge: charge,
      scannable_code: charge.source.scannable_code,
      charge_id: charge.id,
    };
  } catch (error) {
    console.error('❌ Omise Charge Error:', error);
    throw new Error(error.message || 'ไม่สามารถสร้าง Charge ได้');
  }
};

export const getOmiseCharge = async (chargeId) => {
  try {
    const charge = await omise.charges.retrieve(chargeId);
    return {
      success: true,
      charge: charge,
    };
  } catch (error) {
    console.error('❌ Omise Get Charge Error:', error);
    throw new Error('ไม่สามารถดึงข้อมูล Charge ได้');
  }
};

export const verifyWebhookSignature = (webhookData, signature) => {
  // Implement webhook signature verification if needed
  // Omise uses HMAC-SHA256 for webhook signatures
  return true;
};