import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import ChartSection from './components/ChartSection/ChartSection';
import Filters from './components/Filters/Filters';
import FeaturedReviews from './components/FeaturedReviews/FeaturedReviews';
import Footer from './components/Footer/Footer';
import BestReviews from './pages/BestReviews';
import Genres from './pages/Genres';
import Community from './pages/Community';
import NewReviews from './pages/NewReviews';
import PostUpload from './pages/PostUpload';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReviewForm from './pages/ReviewForm';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <ChartSection />
            <Filters />
            <FeaturedReviews />
            <Footer />
          </>
        } />
        <Route path="/best-reviews" element={<BestReviews />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/community" element={<Community />} />
        <Route path="/new-reviews" element={<NewReviews />} />
        <Route path="/post/upload" element={<PostUpload />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/review/write" element={<ReviewForm />} />
      </Routes>
    </Router>
  );
}

export default App; 