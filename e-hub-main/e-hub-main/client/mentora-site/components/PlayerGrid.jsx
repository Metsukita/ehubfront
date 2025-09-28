import React from 'react';
import './PlayerGrid.css';

const players = [
  { name: 'Player1', country: 'BR', team: 'Mentora', sponsors: ['SponsorA'] },
  { name: 'Player2', country: 'BR', team: 'Rise Low', sponsors: ['SponsorB'] },
];

export default function PlayerGrid() {
  return (
    <div className="player-grid">
      {players.map((p, i) => (
        <div className="player-card" key={i}>
          <h4>{p.name}</h4>
          <p>País: {p.country}</p>
          <p>Time: {p.team}</p>
          <p>Patrocinadores: {p.sponsors.join(', ')}</p>
          <button className="primary">Ver perfil</button>
        </div>
      ))}
    </div>
  );
}
