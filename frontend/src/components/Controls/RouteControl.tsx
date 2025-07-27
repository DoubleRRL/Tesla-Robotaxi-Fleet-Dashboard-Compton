import React, { useState, useCallback } from 'react';
import { VehicleContext } from '../../machines/vehicleMachine';

interface RouteControlProps {
  selectedVehicle: VehicleContext | null;
  onSendRoute: (vehicleId: string, route: [number, number][]) => void;
  onClearRoute: (vehicleId: string) => void;
  onReturnToOriginal: (vehicleId: string) => void;
  waypoints: [number, number][];
  isDrawing: boolean;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onClearWaypoints: () => void;
}

const RouteControl: React.FC<RouteControlProps> = ({
  selectedVehicle,
  onSendRoute,
  onClearRoute,
  onReturnToOriginal,
  waypoints,
  isDrawing,
  onStartDrawing,
  onStopDrawing,
  onClearWaypoints
}) => {

  const startDrawing = useCallback(() => {
    onStartDrawing();
  }, [onStartDrawing]);

  const stopDrawing = useCallback(() => {
    onStopDrawing();
  }, [onStopDrawing]);

  const clearWaypoints = useCallback(() => {
    onClearWaypoints();
  }, [onClearWaypoints]);

  const submitRoute = useCallback(() => {
    if (!selectedVehicle || waypoints.length < 2) {
      alert('Please select a vehicle and draw at least 2 waypoints');
      return;
    }

    onSendRoute(selectedVehicle.id, waypoints);
    onClearWaypoints();
  }, [selectedVehicle, waypoints, onSendRoute, onClearWaypoints]);

  const handleClearRoute = useCallback(() => {
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    onClearRoute(selectedVehicle.id);
  }, [selectedVehicle, onClearRoute]);

  const handleReturnToOriginal = useCallback(() => {
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    onReturnToOriginal(selectedVehicle.id);
  }, [selectedVehicle, onReturnToOriginal]);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-white font-bold mb-3">Route Management</h3>
      
      {!selectedVehicle ? (
        <div className="bg-yellow-600 text-white p-3 rounded text-sm mb-3">
          ⚠️ Select a vehicle to manage routes
        </div>
      ) : (
        <div className="mb-3 p-2 bg-gray-700 rounded text-xs">
          <strong>Selected:</strong> {selectedVehicle.id}
          <br />
          <strong>Current Route:</strong> {selectedVehicle.route.length} waypoints
          <br />
          <strong>Status:</strong> {selectedVehicle.status}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={startDrawing}
          disabled={!selectedVehicle || isDrawing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDrawing ? 'Drawing...' : '🎯 Start Drawing Route'}
        </button>

        {isDrawing && (
          <button
            onClick={stopDrawing}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded font-bold text-sm transition-colors"
          >
            ✋ Stop Drawing
          </button>
        )}

        {waypoints.length > 0 && (
          <div className="bg-gray-700 p-2 rounded text-xs">
            <strong>Waypoints:</strong> {waypoints.length}
            <br />
            {waypoints.map((point, index) => (
              <div key={index}>
                {index + 1}. {point[0].toFixed(4)}, {point[1].toFixed(4)}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={submitRoute}
          disabled={!selectedVehicle || waypoints.length < 2}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🚀 Send Route to Vehicle
        </button>

        <button
          onClick={clearWaypoints}
          disabled={waypoints.length === 0}
          className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-3 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🗑️ Clear Waypoints
        </button>

        <button
          onClick={handleClearRoute}
          disabled={!selectedVehicle || selectedVehicle.route.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ❌ Clear Current Route
        </button>

        <button
          onClick={handleReturnToOriginal}
          disabled={!selectedVehicle}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🔄 Return to Original Route
        </button>
      </div>
    </div>
  );
};

export default RouteControl; 