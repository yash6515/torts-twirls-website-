import React from 'react';
import { Link } from 'react-router-dom';
const NotFoundPage = () => (
  <div className="pt-[72px] min-h-screen bg-cream flex items-center justify-center px-4">
    <div className="text-center">
      <p className="font-display text-9xl text-sand font-medium">404</p>
      <h1 className="font-display text-3xl text-deep-brown mt-4 mb-3">Page Not Found</h1>
      <p className="font-sans text-warm-gray mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-block">Go Home</Link>
    </div>
  </div>
);
export default NotFoundPage;
