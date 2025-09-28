import React from 'react';
import './ValorantStats.css';

export default function ValorantStats() {
  return (
    <div className="valorant-stats">
      <h3>Estatísticas Valorant</h3>
      <ul>
        <li>Rating: <strong>1.25</strong></li>
        <li>K/D: <strong>1.10</strong></li>
        <li>Winrate: <strong>58%</strong></li>
        <li>Headshot %: <strong>23%</strong></li>
        <li>Partidas: <strong>120</strong></li>
      </ul>
    </div>
  );
}
