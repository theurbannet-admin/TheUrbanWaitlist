import React from 'react';

// 1. Import assets
import cardImg1 from '../assets/card-image1.png';
import cardImg2 from '../assets/card-image2.png';
import cardImg3 from '../assets/card-image3.png';

export default function UVP() {
  // 2. To keep content organized inside a structured data array
  const cardData = [
    {
      id: 1,
      img: cardImg1,
      title: "Quality",
      description: "We connect users with independent providers who aim to deliver quality services and great experiences."
    },
    {
      id: 2,
      img: cardImg2,
      title: "Trust",
      description: "We support transparency through provider verification, transparency, and secure interactions."
    },
    { 
      id: 3,
      img: cardImg3,
      title: "Growth",
      description: "We provide a platform that supports businesses and communities in growing their reach and connections."
    }
  ];

  return (
    <div className="uvp-section">
      <div className="uvp-header">
        <h2>Our Unique Value Proposition</h2>
        <p>Discover the benefits of joining The Urban Waitlist and how we stand out in the market.</p>
      </div>
      <div className="card-container">
        {/* Dynamic Card Grid Rendering */}
        {cardData.map((card) => (
          <div className="card" key={card.id}>
            <img src={card.img} alt={card.title} />
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}