import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SpotlightCarousel from '../components/SpotlightCarousel';
import TipspaceCTA from '../components/TipspaceCTA';
import LoginCard from '../components/LoginCard';
import GameGrid from '../components/GameGrid';
import VenueSections from '../components/VenueSections';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SpotlightCarousel />
      <TipspaceCTA />
      <LoginCard />
      <GameGrid />
      <VenueSections />
    </>
  );
}
