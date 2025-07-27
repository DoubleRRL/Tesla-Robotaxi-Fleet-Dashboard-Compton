import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import vehicleRoute from './routes/vehicle';
import { initDb } from './utils/dbInit';

envSetup();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json());
app.use('/api/v1/vehicles', vehicleRoute);

// socket.io namespace for vehicle updates
io.of('/vehicles').on('connection', socket => {
  console.log('vehicle dashboard connected');
  
  // listen for sim updates
  socket.on('vehicle-update', data => {
    console.log('Received vehicle update:', data.id, data.status, data.lat, data.lng);
    // broadcast to all dashboard clients
    const clients = io.of('/vehicles').sockets;
    console.log(`Broadcasting to ${clients.size} connected clients`);
    io.of('/vehicles').emit('vehicle-update', data);
  });
  
  socket.on('pull-over', rideData => {
    // log rideData (could write to db/file)
    console.log('PULL OVER:', rideData);
    io.of('/vehicles').emit('pull-over-alert', rideData);
  });
  
  socket.on('control', cmd => {
    // relay control commands to all sims
    io.of('/vehicles').emit('control', cmd);
  });
  
  socket.on('disconnect', () => {
    console.log('vehicle dashboard disconnected');
  });
});

initDb();

app.get('/health', (req, res) => res.send('ok'));

// TODO: add api routes, websocket handlers

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`backend listening on ${PORT}`);
});

function envSetup() {
  require('dotenv').config({ path: '../../.env' });
} 