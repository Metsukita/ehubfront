import React from 'react';
import Navbar from '../components/Navbar';

export default function Hub() {
  return (
    <>
      <Navbar />
      <div className="hub-cards">
        <div className="hub-card">Rise Low</div>
        <div className="hub-card">Copa Mentora</div>
        <div className="hub-card">Super</div>
      </div>
    </>
  );
}
