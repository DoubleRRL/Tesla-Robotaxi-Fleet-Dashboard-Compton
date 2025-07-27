const io = require('socket.io-client');

console.log('Testing socket connection to backend...');

const socket = io('http://localhost:8000/vehicles', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

let updateCount = 0;

socket.on('connect', () => {
  console.log('✅ Connected to backend socket');
});

socket.on('vehicle-update', (data) => {
  updateCount++;
  console.log(`📡 Received vehicle update #${updateCount}:`, data.id, data.status, data.lat, data.lng);
  
  if (updateCount >= 5) {
    console.log('✅ Successfully received 5+ vehicle updates');
    process.exit(0);
  }
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

// Listen for 30 seconds
setTimeout(() => {
  if (updateCount === 0) {
    console.log('❌ No vehicle updates received in 30 seconds');
    console.log('This means either:');
    console.log('1. Simulators are not emitting events');
    console.log('2. Backend is not broadcasting events');
    console.log('3. Socket connection is not working');
  }
  process.exit(1);
}, 30000); 