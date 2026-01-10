// Test the specific dashboard route
async function testDashboardRoute() {
  const testUserId = 'guest'; // Using the actual user ID from the database
  
  try {
    console.log('Testing dashboard route with actual user ID from database...');
    console.log(`URL: http://localhost:5001/api/proposals/dashboard/${testUserId}`);
    
    const response = await fetch(`http://localhost:5001/api/proposals/dashboard/${testUserId}`);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Dashboard data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ Error response:');
      console.log(JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testDashboardRoute();