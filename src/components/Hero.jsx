import React from 'react';

import heroCutOut from '../assets/hero-cutout.png';

export default function Hero() {
    return (
    <div className="hero">
      <div className="hero-content">
        <h1>Find Your <span className="hero-hightlight1">Service</span>. Find Your <span className="hero-highlight2">People</span>. </h1>
        <p>Be first to discover trusted services and experiences near you.</p>
        </div>
        <div className="hero-image">
         <img src={heroCutOut} alt="Hero Image"/>
    </div>
  </div>
  );
}
