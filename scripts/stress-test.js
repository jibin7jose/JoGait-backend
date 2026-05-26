const axios = require('axios');

// Update this token with a valid JWT from your database to test properly
const MOCK_TOKEN = 'replace_with_valid_token';
const API_URL = 'http://localhost:3000/api/sessions/upload';

async function runLoadTest() {
  console.log('Starting Concurrent Upload Stress Test (Simulating 50 rapid mobile syncs)...');
  const requests = [];

  for (let i = 0; i < 50; i++) {
    // Generate a unique UUID for each session to test normal load,
    // OR use the same UUID to test the idempotency locks.
    const sessionId = `stress-test-session-${Date.now()}-${i}`;
    
    const payload = {
      id: sessionId,
      patientId: 'stress-tester',
      deviceId: 'iphone-15-pro',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      metrics: [
        { metricType: 'kneeAngle', value: 45.5, unit: 'degrees', timestamp: new Date().toISOString() },
        { metricType: 'stepCount', value: 120, unit: 'count', timestamp: new Date().toISOString() }
      ]
    };

    requests.push(
      axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      })
    );
  }

  try {
    const results = await Promise.allSettled(requests);
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;

    console.log(`\n--- Stress Test Complete ---`);
    console.log(`✅ Successful Uploads (DB Transactions): ${successes}`);
    console.log(`❌ Failed Uploads (Locks or Auth Errors): ${failures}`);
  } catch (err) {
    console.error('Test script failed completely:', err);
  }
}

runLoadTest();
