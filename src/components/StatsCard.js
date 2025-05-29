import React from 'react';

const StatsCard = ({ title, value, color }) => {
  return (
    <div className="stats-card" style={{ borderLeft: `6px solid ${color}` }}>
      <h4>{title}</h4>
      <p>{value.toLocaleString()}</p>
    </div>
  );
};

export default StatsCard;
