require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'your_mysql_username',
    password: process.env.DB_PASSWORD || 'your_mysql_password',
    database: process.env.DB_NAME || 'your_database_name',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql', 
  },
  test: {
    username: process.env.DB_USERNAME || 'your_mysql_username',
    password: process.env.DB_PASSWORD || 'your_mysql_password',
    database: process.env.DB_TEST_NAME || 'your_test_database_name',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql', 
  },
  production: {
    username: process.env.DB_USERNAME || 'your_mysql_username',
    password: process.env.DB_PASSWORD || 'your_mysql_password',
    database: process.env.DB_PRODUCTION_NAME || 'your_production_database_name',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql', 
  },
};
