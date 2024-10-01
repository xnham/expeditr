import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import './Home.css';

const Home = () => {
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const trimUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      // Keep only the protocol, hostname, and pathname
      return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}`;
    } catch (error) {
      console.error('Invalid URL:', url);
      return url; // Return the original URL if it's invalid
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const trimmedUrls = urls.split('\n')
        .map(url => url.trim())
        .filter(url => url !== '')
        .map(trimUrl);
  
      const response = await fetch('http://localhost:3001/api/prepare-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: trimmedUrls }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to prepare list');
      }
  
      navigate('/shopping_list', { state: { csvFile: data.csvFile } });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      {isLoading && <Loader />}
      <div className="title-and-image">
        <h2 className="title">
          <span className="darker-text">Recipe URLs<br /></span>
          <span className="to-shopping-list">
            <span className="lighter-text">to</span>
            <span className="darker-text"> shopping list<br /></span>
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
        <button type="submit" className="prepare-button" disabled={isLoading}>
          {isLoading ? 'Preparing...' : 'Prepare List →'}
        </button>
      </form>
      {error && (
        <div className="error-message">
          Error: {error}
          <br />
          Please try again or contact support if the problem persists.
        </div>
      )}
    </div>
  );
};

export default Home;