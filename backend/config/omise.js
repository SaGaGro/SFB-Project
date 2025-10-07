import Omise from 'omise';
import dotenv from 'dotenv';

dotenv.config();

const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

export default omise;