// Simple test to debug the dashboard endpoint
const testUserId = 'test-user-id'; // Replace with actual user ID from your database

async function testEndpoint() {
  try {
    console.log('Testing dashboard endpoint...');
    console.log(`URL: http://localhost:5001/api/proposals/dashboard/${testUserId}`);
    
    const response = await fetch(`http://localhost:5001/api/proposals/dashboard/${testUserId}`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test if server is running
async function testServerHealth() {
  try {
    console.log('Testing server health...');
    const response = await fetch('http://localhost:5001/health');
    const data = await response.json();
    console.log('Health check:', data);
    return true;
  } catch (error) {
    console.error('Server not running or not accessible:', error.message);
    return false;
  }
}

async function testAllRoutes() {
  console.log('=== Testing All Proposal Routes ===');
  
  const routes = [
    'http://localhost:5001/api/proposals',
    `http://localhost:5001/api/proposals/user/${testUserId}`,
    `http://localhost:5001/api/proposals/dashboard/${testUserId}`
  ];
  
  for (const url of routes) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await fetch(url);
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.status !== 404) {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error(`Error testing ${url}:`, error.message);
    }
  }
}

async function main() {
  const serverRunning = await testServerHealth();
  
  if (serverRunning) {
    await testAllRoutes();
  } else {
    console.log('\n❌ Backend server is not running on port 5001');
    console.log('Please start the backend server with: npm start or npm run dev');
  }
}

main();