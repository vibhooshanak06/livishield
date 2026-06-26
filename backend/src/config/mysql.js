const mysql = require('mysql2/promise');

let pool;

const connectMySQL = async () => {
  try {
    pool = mysql.createPool({
      host:             process.env.MYSQL_HOST     || 'localhost',
      port:             parseInt(process.env.MYSQL_PORT) || 3306,
      user:             process.env.MYSQL_USER     || 'root',
      password:         process.env.MYSQL_PASSWORD,
      database:         process.env.MYSQL_DATABASE || 'livishield',
      waitForConnections: true,
      connectionLimit:  20,
      queueLimit:       0,
      enableKeepAlive:  true,
      keepAliveInitialDelay: 30000,
    });

    // Verify the pool can acquire a connection
    const conn = await pool.getConnection();
    await conn.execute('SELECT 1');
    conn.release();

    return pool;
  } catch (error) {
    throw error;
  }
};

const getConnection = () => {
  if (!pool) {
    throw new Error('MySQL pool not initialised. Call connectMySQL() first.');
  }
  return pool;
};

module.exports = { connectMySQL, getConnection };
