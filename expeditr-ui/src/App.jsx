import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Header from './Header';
import Home from './Home';
import ShoppingList from './ShoppingList';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shopping_list" element={<ShoppingList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;