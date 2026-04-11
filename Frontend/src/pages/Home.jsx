import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Home = () => {
  return (
    <div className="gradient-bg min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">CampusConnect</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your comprehensive campus management solution. Streamline attendance, appointments, and communication 
            between students, faculty, and administrators.
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <Button size="lg" className="px-8 py-4 text-lg">
                Get Started
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
