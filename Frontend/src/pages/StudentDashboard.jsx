import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const attendanceData = [
    { subject: 'Data Structures', present: 18, total: 20, percentage: 90 },
    { subject: 'Algorithms', present: 16, total: 20, percentage: 80 },
    { subject: 'Database Systems', present: 19, total: 20, percentage: 95 },
    { subject: 'Web Development', present: 17, total: 20, percentage: 85 }
  ];

  const appointments = [
    { id: 1, faculty: 'Dr. Jane Smith', subject: 'Data Structures', date: '2024-01-15', time: '10:00 AM', status: 'confirmed' },
    { id: 2, faculty: 'Prof. John Doe', subject: 'Algorithms', date: '2024-01-16', time: '2:00 PM', status: 'pending' },
    { id: 3, faculty: 'Dr. Alice Johnson', subject: 'Database Systems', date: '2024-01-17', time: '11:00 AM', status: 'confirmed' }
  ];

  const announcements = [
    { id: 1, title: 'Mid-term Examination Schedule', date: '2024-01-10', priority: 'high', content: 'Mid-term examinations will begin from next week. Please check the schedule.' },
    { id: 2, title: 'Hackathon 2024', date: '2024-01-08', priority: 'medium', content: 'Annual hackathon registration is now open. Register before January 20th.' },
    { id: 3, title: 'Library Hours Extended', date: '2024-01-05', priority: 'low', content: 'Library hours extended during exam period. Open until 10 PM.' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Attendance</p>
              <p className="text-2xl font-bold text-gray-900">87.5%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Appointments</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Announcements</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {attendanceData.slice(0, 3).map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{subject.subject}</p>
                  <p className="text-xs text-gray-600">{subject.present}/{subject.total} classes</p>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        subject.percentage >= 85 ? 'bg-green-500' : 
                        subject.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{subject.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{appointment.faculty}</p>
                <p className="text-xs text-gray-600">{appointment.subject}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">{appointment.date} at {appointment.time}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Overview</h2>
        <Button variant="outline">Download Report</Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h3>
        <div className="space-y-4">
          {attendanceData.map((subject, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-lg font-medium text-gray-900">{subject.subject}</p>
                  <p className="text-sm text-gray-600">{subject.present} out of {subject.total} classes attended</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    subject.percentage >= 85 ? 'text-green-600' : 
                    subject.percentage >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {subject.percentage}%
                  </p>
                  <p className="text-xs text-gray-600">Attendance</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    subject.percentage >= 85 ? 'bg-green-500' : 
                    subject.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${subject.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Statistics</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">70</p>
            <p className="text-sm text-gray-600">Total Classes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">61</p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">9</p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">87.5%</p>
            <p className="text-sm text-gray-600">Overall</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <Button>Book New Appointment</Button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">{appointment.faculty}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">{appointment.subject}</p>
                <p className="text-sm text-gray-500">
                  <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {appointment.date} at {appointment.time}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Reschedule</Button>
                <Button variant="danger" size="sm">Cancel</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} hover={true}>
            <div className="flex items-start">
              <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                announcement.priority === 'high' ? 'bg-red-500' :
                announcement.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <span className="text-sm text-gray-500">{announcement.date}</span>
                </div>
                <p className="text-gray-600">{announcement.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'attendance':
        return renderAttendance();
      case 'appointments':
        return renderAppointments();
      case 'announcements':
        return renderAnnouncements();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="student" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your academics today.</p>
          </div>
          
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['overview', 'attendance', 'appointments', 'announcements'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                    activeSection === section
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
