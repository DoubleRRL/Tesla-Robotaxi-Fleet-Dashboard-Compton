const io = require('socket.io-client');

console.log('Testing simulator connection...');

const socket = io('http://localhost:8000/vehicles', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Simulator connected to backend');
  
  // Test emitting a vehicle update
  const testUpdate = {
    id: 'test-vehicle',
    lat: 33.9000,
    lng: -118.2200,
    progress: 50,
    speed: 25,
    battery: 80,
    eta: '2 min',
    status: 'en route',
    heading: 45
  };
  
  console.log('📤 Emitting test vehicle update:', testUpdate);
  socket.emit('vehicle-update', testUpdate);
  
  // Wait 5 seconds then disconnect
  setTimeout(() => {
    console.log('🔌 Disconnecting test simulator');
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('❌ Connection timeout');
  process.exit(1);
}, 10000); 