import React, { useState } from 'react';

interface QuickTourPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickTourPanel({ isOpen, onClose }: QuickTourPanelProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      title: "Welcome to Tesla Fleet Ops",
      content: "This dashboard manages 15 robotaxis in Compton, CA. You can track vehicles, assign routes, and monitor fleet performance in real-time.",
      action: "Next"
    },
    {
      title: "Select a Vehicle",
      content: "Click on any vehicle marker on the map or use the dropdown in the left panel to select a vehicle. This will show you detailed stats and enable controls.",
      action: "Next"
    },
    {
      title: "View Vehicle Status",
      content: "Selected vehicles show their current status: Available, En-route, Picking up, Dropping off, Charging, or Pull-over. Battery level and ETA are displayed.",
      action: "Next"
    },
    {
      title: "Draw a Route",
      content: "Click on the map to draw waypoints for a new route. The system will automatically snap your route to actual roads using OSRM routing.",
      action: "Next"
    },
    {
      title: "Snap to Road",
      content: "Click 'Snap to Road' to convert your waypoints into a proper driving route. The system checks if the selected vehicle has enough battery for the trip.",
      action: "Next"
    },
    {
      title: "Send Route",
      content: "Click 'Send Route' to assign the route to the selected vehicle. The vehicle will immediately start following the new route.",
      action: "Next"
    },
    {
      title: "Advanced Controls",
      content: "Use the controls panel to lock/unlock vehicles, emergency stop, or reroute. These commands are sent directly to the vehicle's systems.",
      action: "Next"
    },
    {
      title: "Monitor Fleet",
      content: "Watch the analytics panel for fleet utilization, surge pricing, and charging status. The system automatically manages vehicle charging and maintenance.",
      action: "Finish"
    }
  ];

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-tesla-gray border-2 border-tesla-blue rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold text-lg">{currentTourStep.title}</h2>
          <button 
            onClick={onClose}
            className="text-tesla-blue hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          {currentTourStep.content}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-tesla-black text-white px-4 py-2 rounded font-bold text-sm"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={() => {
                if (currentStep < tourSteps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onClose();
                }
              }}
              className="bg-tesla-blue text-white px-4 py-2 rounded font-bold text-sm"
            >
              {currentTourStep.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 