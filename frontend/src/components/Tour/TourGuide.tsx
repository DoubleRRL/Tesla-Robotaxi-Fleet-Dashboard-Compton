import React from 'react';
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: 'body',
    content: 'welcome to the tesla robotaxi dashboard! this tour will show you how to dispatch and monitor a robotaxi.'
  },
  {
    target: '.leaflet-container',
    content: 'step 1: draw a route by clicking on the map.'
  },
  {
    target: '.snap-to-road-btn',
    content: 'step 2: click “snap to road” to make your route follow real streets.'
  },
  {
    target: '.route-control-btn',
    content: 'step 3: click “send route” to dispatch a vehicle.'
  },
  {
    target: '.vehicle-marker',
    content: 'step 4: watch the vehicle drive the route in real time.'
  },
  {
    target: '.stats-panel',
    content: 'step 5: view live stats and controls here.'
  },
  {
    target: '.help-btn',
    content: 'you can replay this tour anytime by clicking the help button.'
  }
];

export default function TourGuide({ run, stepIndex, setStepIndex }: { run: boolean, stepIndex: number, setStepIndex: (i: number) => void }) {
  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showSkipButton
        showProgress
        callback={data => {
          if (data.action === 'next' || data.action === 'prev') {
            setStepIndex(data.index + (data.action === 'next' ? 1 : -1));
          }
        }}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#e82127',
            textColor: '#171a20',
            backgroundColor: '#fff',
          }
        }}
      />
      <button
        className="help-btn fixed bottom-4 right-4 bg-tesla-blue text-white px-4 py-2 rounded font-bold z-50"
        onClick={() => setStepIndex(0)}
      >
        Help
      </button>
    </>
  );
} 