# Tesla Robotaxi Fleet Management Dashboard - Compton, CA

A real-time fleet management platform for Tesla robotaxis operating in Compton, California. Built with low-latency technologies for safety-critical autonomous vehicle operations.

## 🚗 Fleet Overview

**15 Vehicles in Compton, CA:**
- **4 Cybertrucks** (cybertruck-1 through cybertruck-4)
- **8 Model Ys** (modely-1 through modely-8) 
- **3 Model Xs** (modelx-1 through modelx-3)

## ✨ Features

### 🗺️ Real-Time Mapping & Navigation
- **OpenStreetMap Integration** with real Compton city boundary
- **OSRM Route Snapping** - converts waypoints to actual driving routes
- **Real-time Vehicle Tracking** with live position updates
- **Interactive Route Drawing** - click map to create waypoints

### 🚙 Vehicle Management
- **Vehicle Selection** - click markers or use dropdown to select vehicles
- **Live Status Monitoring** - Available, En-route, Picking up, Dropping off, Charging, Pull-over
- **Battery Management** - automatic battery checks before route assignment
- **Detailed Vehicle Info** - battery, speed, ETA, progress, status

### 🎮 Advanced Controls
- **Remote Lock/Unlock** - control vehicle access
- **Emergency Stop** - immediate vehicle halt with safety systems
- **Route Cancellation** - cancel current routes and return to available status
- **Real-time Commands** - direct vehicle control via WebSocket

### 📊 Fleet Analytics
- **Utilization Tracking** - real-time fleet efficiency metrics
- **Surge Pricing** - dynamic pricing based on demand
- **Revenue Monitoring** - live revenue tracking
- **Charging Management** - automatic charging station coordination

### 🚨 Safety & Monitoring
- **Rider Pull-over Events** - <4% probability simulation with alerts
- **Video Feed Placeholders** - ML analysis preparation for Dojo2
- **Emergency Response** - immediate vehicle control capabilities
- **Real-time Alerts** - instant notification system

### 🎯 User Experience
- **Quick Tour Guide** - step-by-step onboarding tutorial
- **Tesla-Inspired UI** - dark theme with professional aesthetics
- **Responsive Design** - optimized for various screen sizes
- **Intuitive Controls** - easy-to-use interface for fleet operators

## 🛠️ Technology Stack

### Frontend
- **React 18** + **Next.js 14** - modern, fast UI framework
- **Tailwind CSS** - Tesla-inspired styling
- **React-Leaflet** - OpenStreetMap integration
- **Socket.io-client** - real-time communication
- **Zustand** - lightweight state management

### Backend
- **Node.js 20+** with **TypeScript** - high-performance runtime
- **Express.js** - RESTful API framework
- **Socket.io** - real-time WebSocket communication
- **PostgreSQL** - persistent data storage
- **Redis** - caching and pub/sub

### Simulation
- **TypeScript** - type-safe simulation logic
- **OSRM** - Open Source Routing Machine for route snapping
- **Real-time Updates** - live vehicle movement simulation

### Infrastructure
- **Docker** + **Docker Compose** - containerized deployment
- **OpenStreetMap** - free, open mapping data
- **WebSocket** - sub-second latency communication

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/DoubleRRL/Tesla-Robotaxi-Fleet-Dashboard-Compton.git
cd Tesla-Robotaxi-Fleet-Dashboard-Compton

# Install dependencies
npm run install:all

# Start the development environment
npm run dev

# In a new terminal, launch vehicle simulators (with delays to prevent race conditions)
./launch-sims-delayed.sh
```

### Access the Dashboard
Open [http://localhost:3000](http://localhost:3000) in your browser.

### ✅ Current Status
**All systems operational!** The dashboard is fully functional with:
- ✅ 15 vehicle simulators running and emitting real-time updates
- ✅ Real-time vehicle tracking on OpenStreetMap
- ✅ Interactive route creation and vehicle assignment
- ✅ Advanced controls (lock, unlock, emergency stop, reroute)
- ✅ Fleet analytics and monitoring

## 🎮 How to Use

### 1. Quick Tour
Click the "Quick Tour" button for step-by-step instructions.

### 2. Select a Vehicle
- Click any vehicle marker on the map, or
- Use the vehicle dropdown in the left panel

### 3. View Vehicle Details
- Vehicle status (Available, En-route, etc.)
- Battery level and ETA
- Current speed and progress
- Real-time location

### 4. Create a Route
- Click on the map to draw waypoints
- Click "Snap to Road" to convert to driving route
- System checks battery requirements automatically
- Click "Send Route" to assign to selected vehicle

### 5. Advanced Controls
- **Lock/Unlock** - control vehicle access
- **Emergency Stop** - immediate halt (with confirmation)
- **Reroute** - cancel current route

### 6. Monitor Fleet
- Watch analytics panel for utilization
- Monitor surge pricing changes
- Track charging vehicles

## 🏗️ Project Structure

```
robotaxi-fleet-dashboard/
├── frontend/                 # React/Next.js frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Next.js pages
│   │   └── styles/          # CSS and styling
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utilities
├── simulation/               # Vehicle simulation
│   └── src/
│       └── VehicleSimulator.ts
├── shared/                   # Shared types and constants
└── docker-compose.dev.yml    # Development environment
```

## 🔧 Development

### Available Scripts
```bash
npm run install:all    # Install all dependencies
npm run dev           # Start development servers
./launch-sims-delayed.sh  # Launch vehicle simulators (recommended)
./launch-sims.sh      # Launch simulators (legacy, may have race conditions)
npm run migrate       # Run database migrations
npm run seed          # Seed initial data
```

### Environment Variables
Create `.env` files in `frontend/` and `backend/` directories:
```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/robotaxi
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚨 Safety Features

- **Real-time Monitoring** - continuous vehicle tracking with sub-second updates
- **Emergency Controls** - immediate vehicle override capabilities
- **Battery Management** - automatic charging coordination and battery checks
- **Pull-over Detection** - rider-initiated stops with logging (<4% probability simulation)
- **Route Validation** - battery and safety checks before route assignment
- **Boundary Enforcement** - vehicles stay within Compton city limits
- **Street-based Routing** - realistic movement on actual Compton streets

## 📈 Performance

- **Sub-second Response** - <100ms latency for critical operations
- **Real-time Updates** - 15 vehicles emitting updates every 1-3 seconds
- **Stable WebSocket Connections** - 60s ping timeout, 25s interval
- **Race Condition Prevention** - delayed simulator launches for reliability
- **Boundary Validation** - real-time position validation within Compton limits
- **Horizontal Scaling** - designed for 10,000+ vehicles

## 🔒 Security

- **JWT Authentication** - secure API access
- **RBAC** - role-based access control
- **Rate Limiting** - API protection
- **E2E Encryption** - secure communication

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Local development setup
- Production Docker deployment
- Kubernetes orchestration
- Monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Recent Fixes

### Critical Bug Fixes (Latest Update)
- **Fixed Vehicle Simulator Timing Bug** - Resolved issue where simulators weren't emitting updates due to incorrect `lastUpdateTime` initialization
- **Improved Socket.io Stability** - Added proper ping timeout configuration (60s timeout, 25s interval)
- **Race Condition Prevention** - Created `launch-sims-delayed.sh` with 0.5s delays between simulator launches
- **Build Artifact Cleanup** - Updated `.gitignore` to exclude `.next/` directory

### Known Issues
- OSRM route snapping may fail occasionally (fallback to street points works)
- Some vehicles may reposition when going off-street (automatic boundary enforcement)

## 🆘 Support

For issues and questions:
- Check the Quick Tour in the application
- Review the deployment documentation
- Open an issue on GitHub

---

**Built for Tesla Robotaxi Operations in Compton, CA** 🚗⚡ 