import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import ChartSection from './components/ChartSection/ChartSection';
import Filters from './components/Filters/Filters';
import FeaturedReviews from './components/FeaturedReviews/FeaturedReviews';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import WritePost from './pages/WritePost';
import PostDetail from './pages/PostDetail';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import EditPost from './pages/EditPost';

// 코드 스플리팅 적용
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const WriteReview = React.lazy(() => import('./pages/WriteReview'));
const BestReviews = React.lazy(() => import('./pages/BestReviews'));
const Genres = React.lazy(() => import('./pages/Genres'));
const Community = React.lazy(() => import('./pages/Community'));
const NewReviews = React.lazy(() => import('./pages/NewReviews'));
const PostUpload = React.lazy(() => import('./pages/PostUpload'));
const ReviewForm = React.lazy(() => import('./pages/ReviewForm'));

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Suspense fallback={<div>로딩중...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/write-review" element={<WriteReview />} />
            <Route path="/best-reviews" element={<BestReviews />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/write" element={<WritePost />} />
            <Route path="/community/post/:postId" element={<PostDetail />} />
            <Route path="/community/post/:postId/edit" element={<EditPost />} />
            <Route path="/new-reviews" element={<NewReviews />} />
            <Route path="/post/upload" element={<PostUpload />} />
            <Route path="/review/write" element={<ReviewForm />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 