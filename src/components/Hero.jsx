import React from 'react';

import heroCutOut from '../assets/hero-cutout.png';

export default function Hero() {
    return (
    <div className="hero">
      <div className="content">
        <h1>Find Your Service. <br />Find Your People. </h1>
        <p>Be first to discover trusted services and experiences near you.</p>
        </div>
        <div className="hero-image">
         <img src={heroCutOut} alt="Hero Image"/>
    </div>
  </div>
  );
}
