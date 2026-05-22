import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Mission from './components/Mission';
import UVP from './components/UVP';
import Footer from './components/Footer';
import './index.css'; 

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Mission />
      <UVP />
      <Footer />
    </>
  );
}
