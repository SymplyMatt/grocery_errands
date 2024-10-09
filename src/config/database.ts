import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'your_database_name',
  process.env.DB_USERNAME || 'your_postgres_username',
  process.env.DB_PASSWORD || 'your_postgres_password',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.NODE_ENV === 'development' ? 3306 : 5433,
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
