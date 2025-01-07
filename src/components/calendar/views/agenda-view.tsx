'use client'

import React from 'react';
import TimelineContainer from '../timeline/timeline-container';

const AgendaView: React.FC = () => {
  return (
    <div className="h-full overflow-hidden">
      <TimelineContainer />
    </div>
  );
};

export default AgendaView;