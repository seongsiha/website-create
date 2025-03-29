import React from 'react';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import ChartSection from './components/ChartSection/ChartSection';
import Filters from './components/Filters/Filters';
import FeaturedReviews from './components/FeaturedReviews/FeaturedReviews';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="App">
      <Navigation />
      <Hero />
      <ChartSection />
      <Filters />
      <FeaturedReviews />
      <Footer />
    </div>
  );
}

export default App; 