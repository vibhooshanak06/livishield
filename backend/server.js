const app = require('./src/app');
const connectMongoDB = require('./src/config/mongodb');
const { connectMySQL } = require('./src/config/mysql');

const PORT = process.env.PORT || 5000;

// Connect to databases
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Try to connect to MySQL (optional for development)
    try {
      await connectMySQL();
    } catch (mysqlError) {
      // MySQL connection failed - continue without it
    }

    // Start server
    app.listen(PORT, () => {
      // Server started successfully
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();