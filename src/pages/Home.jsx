import React from 'react';
import Hero from '../components/Hero/Hero';
import ChartSection from '../components/ChartSection/ChartSection';
import Filters from '../components/Filters/Filters';
import FeaturedReviews from '../components/FeaturedReviews/FeaturedReviews';

const Home = () => {
  return (
    <>
      <Hero />
      <ChartSection />
      <Filters />
      <FeaturedReviews />
    </>
  );
};

export default Home; 