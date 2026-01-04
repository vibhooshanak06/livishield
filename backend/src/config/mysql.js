const mysql = require('mysql2/promise');

let connection;

const connectMySQL = async () => {
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'livishield',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    await connection.execute('SELECT 1');
    
    return connection;
  } catch (error) {
    throw error;
  }
};

const getConnection = () => {
  if (!connection) {
    throw new Error('MySQL connection not established');
  }
  return connection;
};

module.exports = { connectMySQL, getConnection };