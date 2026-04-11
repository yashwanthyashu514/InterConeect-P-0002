import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Features = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16" data-aos="fade-up">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Education
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Experience the future of campus management with cutting-edge technology designed to streamline 
              your educational journey and enhance productivity.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card 
                hover={true} 
                className="text-center group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl" 
                data-aos="fade-up" 
                data-aos-delay="200"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Digital Learning</h3>
                <p className="text-gray-600">
                  Access course materials, submit assignments, and track your academic progress seamlessly.
                </p>
              </Card>

              <Card 
                hover={true} 
                className="text-center group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl" 
                data-aos="fade-up" 
                data-aos-delay="300"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Smart Attendance</h3>
                <p className="text-gray-600">
                  Automated attendance tracking with QR codes and real-time reporting for accurate records.
                </p>
              </Card>

              <Card 
                hover={true} 
                className="text-center group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl" 
                data-aos="fade-up" 
                data-aos-delay="400"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Easy Scheduling</h3>
                <p className="text-gray-600">
                  Book appointments, manage meetings, and coordinate schedules with intelligent calendar integration.
                </p>
              </Card>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-16" data-aos="fade-up" data-aos-delay="500">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Core Capabilities</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center group" data-aos="fade-up" data-aos-delay="600">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Secure Access</h4>
                  <p className="text-sm text-gray-600">Role-based authentication</p>
                </div>

                <div className="text-center group" data-aos="fade-up" data-aos-delay="700">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Real-time Updates</h4>
                  <p className="text-sm text-gray-600">Instant notifications</p>
                </div>

                <div className="text-center group" data-aos="fade-up" data-aos-delay="800">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Analytics</h4>
                  <p className="text-sm text-gray-600">Comprehensive reporting</p>
                </div>

                <div className="text-center group" data-aos="fade-up" data-aos-delay="900">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Dashboard</h4>
                  <p className="text-sm text-gray-600">Intuitive interface</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-16" data-aos="fade-up" data-aos-delay="1000">
              <Link to="/portal">
                <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Features;
