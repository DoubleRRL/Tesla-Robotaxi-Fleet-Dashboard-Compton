import React from 'react';
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: 'body',
    content: 'welcome to the tesla robotaxi dashboard!'
  },
  {
    target: '.leaflet-container',
    content: 'draw a route by clicking on the map.'
  },
  {
    target: '.route-control-btn',
    content: 'click “send route” to dispatch a vehicle.'
  },
  {
    target: '.vehicle-marker',
    content: 'watch the vehicle drive the route in real time.'
  },
  {
    target: '.stats-panel',
    content: 'view live stats and controls here.'
  },
  {
    target: 'body',
    content: 'that’s it, you’re ready to roll!'
  }
];

export default function TourGuide({ run, stepIndex, setStepIndex }: { run: boolean, stepIndex: number, setStepIndex: (i: number) => void }) {
  return (
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
  );
} 