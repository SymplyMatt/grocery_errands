import dotenv from 'dotenv';
dotenv.config();

const validateEnv = () => {
  if (!process.env.PORT) {
    throw new Error('Missing PORT in environment variables');
  }
};
export default validateEnv;
