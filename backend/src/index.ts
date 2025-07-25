import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import vehicleRoute from './routes/vehicle';

envSetup();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/v1/vehicles', vehicleRoute);

// socket.io namespace for vehicle updates
io.of('/vehicles').on('connection', socket => {
  console.log('vehicle dashboard connected');
  // listen for sim updates
  socket.on('vehicle-update', data => {
    // broadcast to all dashboard clients
    io.of('/vehicles').emit('vehicle-update', data);
  });
});

app.get('/health', (req, res) => res.send('ok'));

// TODO: add api routes, websocket handlers

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`backend listening on ${PORT}`);
});

function envSetup() {
  require('dotenv').config({ path: '../../.env' });
} 