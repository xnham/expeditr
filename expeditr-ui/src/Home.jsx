import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [urls, setUrls] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="home-container"> {/* Container is now centered and dynamic */}
      <div className="title-and-image">
        <h2 className="title">
          <span className="darker-text">Recipe URLs<br></br></span>
          <span className="to-shopping-list">
            <span className="lighter-text">to</span>
            <span className="darker-text"> shopping list<br></br></span>
          </span>
          <span className="lighter-text">in seconds.</span>
        </h2>
        <img
          src="/thin_radish_jumping_into_basket.png"
          alt="Thin radish jumping into basket"
          className="veg-image"
        />
      </div>
      <div className="paste-text">
        <p>Paste up to 10 recipe URLs, one per line.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          className="url-input"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={`https://www.recipe.com/recipe-one\nhttps://www.recipe.com/recipe-two\nhttps://www.recipe.com/recipe-three`}
        />
        <button type="submit" className="prepare-button">Prepare list →</button>
      </form>
    </div>
  );
};

export default Home;
