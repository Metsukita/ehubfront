import React from 'react';
import Navbar from '../components/Navbar';
import TournamentCard from '../components/TournamentCard';

const tournaments = [
  { title: 'Rise Low', prize: 'R$ 500', date: '28/09', buyin: 'R$ 10' },
  { title: 'Copa Mentora', prize: 'R$ 1000', date: '05/10', buyin: 'R$ 20' },
];

export default function Tournaments() {
  return (
    <>
      <Navbar />
      <div className="tournaments-list">
        {tournaments.map((t, i) => (
          <TournamentCard key={i} {...t} />
        ))}
      </div>
    </>
  );
}
