import React from 'react';
import { BounceLoader } from 'react-spinners';
import './Loader.css';

const Loader = () => {
  return (
    <div className="overlay">
      <div className="loading-container">
        <div className="loading-text-and-dots">
          <span className="loading-text-main">Preparing your list</span>
          <div className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
        <span className="loading-text-small">This may take a few minutes. You can go to another browser tab, but do not close this one.</span>
        <BounceLoader color="#FFF8ED" size={100} />
      </div>
    </div>
  );
};

export default Loader;