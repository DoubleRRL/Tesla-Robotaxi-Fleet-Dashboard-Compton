const io = require('socket.io-client');

console.log('Testing minimal simulator connection...');

const socket = io('http://localhost:8000/vehicles', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Minimal simulator connected to backend');
  
  // Send a test vehicle update immediately
  const testUpdate = {
    id: 'minimal-test',
    lat: 33.9000,
    lng: -118.2200,
    progress: 0,
    speed: 25,
    battery: 80,
    eta: 'test',
    status: 'en route',
    heading: 0
  };
  
  console.log('📤 Sending test vehicle update:', testUpdate);
  socket.emit('vehicle-update', testUpdate);
  
  // Send another update after 2 seconds
  setTimeout(() => {
    const update2 = { ...testUpdate, progress: 50, lat: 33.9100, lng: -118.2100 };
    console.log('📤 Sending second test vehicle update:', update2);
    socket.emit('vehicle-update', update2);
  }, 2000);
  
  // Keep running for 10 seconds
  setTimeout(() => {
    console.log('🔌 Disconnecting minimal simulator');
    socket.disconnect();
    process.exit(0);
  }, 10000);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.log('❌ Connection timeout');
  process.exit(1);
}, 15000); 