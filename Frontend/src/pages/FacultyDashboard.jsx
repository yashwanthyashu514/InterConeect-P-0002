import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [attendanceMode, setAttendanceMode] = useState('manual');
  const [selectedClass, setSelectedClass] = useState('');

  const classes = [
    { id: 1, name: 'Data Structures - 4th Sem A', code: 'CS401', students: 45 },
    { id: 2, name: 'Algorithms - 4th Sem B', code: 'CS402', students: 42 },
    { id: 3, name: 'Database Systems - 4th Sem A', code: 'CS403', students: 45 },
    { id: 4, name: 'Web Development - 4th Sem C', code: 'CS404', students: 38 }
  ];

  const students = [
    { id: 1, name: 'John Doe', usn: '1BM21CS001', email: 'john@campus.com', attendance: 85 },
    { id: 2, name: 'Jane Smith', usn: '1BM21CS002', email: 'jane@campus.com', attendance: 92 },
    { id: 3, name: 'Mike Johnson', usn: '1BM21CS003', email: 'mike@campus.com', attendance: 78 },
    { id: 4, name: 'Sarah Wilson', usn: '1BM21CS004', email: 'sarah@campus.com', attendance: 88 },
    { id: 5, name: 'Tom Brown', usn: '1BM21CS005', email: 'tom@campus.com', attendance: 95 }
  ];

  const appointments = [
    { id: 1, student: 'John Doe', subject: 'Data Structures', date: '2024-01-15', time: '10:00 AM', status: 'confirmed', purpose: 'Project discussion' },
    { id: 2, student: 'Jane Smith', subject: 'Algorithms', date: '2024-01-16', time: '2:00 PM', status: 'pending', purpose: 'Doubt clearing' },
    { id: 3, student: 'Mike Johnson', subject: 'Database Systems', date: '2024-01-17', time: '11:00 AM', status: 'confirmed', purpose: 'Assignment help' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">170</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Classes</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Data Structures</p>
                <p className="text-sm text-gray-600">4th Sem A - Room 301</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">9:00 - 10:00 AM</p>
                <p className="text-xs text-blue-600">In Progress</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Algorithms</p>
                <p className="text-sm text-gray-600">4th Sem B - Room 302</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">11:00 AM - 12:00 PM</p>
                <p className="text-xs text-gray-500">Upcoming</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Database Systems</p>
                <p className="text-sm text-gray-600">4th Sem A - Lab 201</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">2:00 - 4:00 PM</p>
                <p className="text-xs text-gray-500">Upcoming</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
          <div className="space-y-3">
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{appointment.student}</p>
                <p className="text-xs text-gray-600">{appointment.subject} - {appointment.purpose}</p>
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
        <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
      </div>

      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.students} students)
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAttendanceMode('manual')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    attendanceMode === 'manual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="font-medium">Manual Entry</p>
                  <p className="text-sm text-gray-600">Mark students manually</p>
                </button>
                <button
                  onClick={() => setAttendanceMode('qr')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    attendanceMode === 'qr'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="font-medium">QR Code</p>
                  <p className="text-sm text-gray-600">Scan QR codes (Coming soon)</p>
                </button>
              </div>
            </div>

            {attendanceMode === 'manual' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Student List</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Mark All Present</Button>
                    <Button variant="outline" size="sm">Mark All Absent</Button>
                    <Button>Submit Attendance</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">USN</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{student.usn}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{student.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                                Present
                              </button>
                              <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200">
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {attendanceMode === 'qr' && (
              <div className="text-center py-12">
                <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">QR Code Scanner Coming Soon</p>
                <p className="text-sm text-gray-500">Students will be able to scan QR codes for automatic attendance</p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <Button>Manage Schedule</Button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">{appointment.student}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">{appointment.subject} - {appointment.purpose}</p>
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

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <Button variant="outline">Export Data</Button>
      </div>

      <Card>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students by name or USN..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">USN</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Attendance %</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{student.usn}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{student.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.attendance >= 85 ? 'bg-green-100 text-green-800' :
                      student.attendance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button variant="outline" size="sm">View Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
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
      case 'students':
        return renderStudents();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="faculty" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Manage your classes and track student progress.</p>
          </div>
          
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['overview', 'attendance', 'appointments', 'students'].map((section) => (
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

export default FacultyDashboard;
