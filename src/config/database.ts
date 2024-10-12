import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'your_database_name',
  process.env.DB_USERNAME || 'your_postgres_username',
  process.env.DB_PASSWORD || 'your_postgres_password',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established.');
  })
  .catch((error: Error) => {
    console.error('Unable to connect to the database:', error);
});
