import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddUser, setShowAddUser] = useState(false);

  const users = [
    { id: 1, name: 'John Doe', email: 'john@campus.com', role: 'student', usn: '1BM21CS001', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@campus.com', role: 'student', usn: '1BM21CS002', status: 'active' },
    { id: 3, name: 'Dr. Alice Johnson', email: 'alice@campus.com', role: 'faculty', department: 'Computer Science', status: 'active' },
    { id: 4, name: 'Prof. Bob Wilson', email: 'bob@campus.com', role: 'faculty', department: 'Mathematics', status: 'active' },
    { id: 5, name: 'Admin User', email: 'admin@campus.com', role: 'admin', status: 'active' }
  ];

  const systemStats = {
    totalUsers: 1250,
    activeUsers: 1180,
    totalClasses: 45,
    totalAppointments: 234,
    averageAttendance: 87.5,
    systemUptime: '99.9%'
  };

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Logged in', time: '2 mins ago', type: 'login' },
    { id: 2, user: 'Dr. Alice Johnson', action: 'Marked attendance for Data Structures', time: '15 mins ago', type: 'attendance' },
    { id: 3, user: 'Jane Smith', action: 'Booked appointment with Prof. Bob Wilson', time: '1 hour ago', type: 'appointment' },
    { id: 4, user: 'Admin User', action: 'Added new student', time: '2 hours ago', type: 'user_management' },
    { id: 5, user: 'System', action: 'Generated attendance report', time: '3 hours ago', type: 'system' }
  ];

  const reports = [
    { id: 1, name: 'Monthly Attendance Report', date: '2024-01-01', type: 'attendance', status: 'completed' },
    { id: 2, name: 'Student Performance Analysis', date: '2024-01-05', type: 'performance', status: 'completed' },
    { id: 3, name: 'Faculty Workload Report', date: '2024-01-10', type: 'faculty', status: 'in_progress' },
    { id: 4, name: 'System Usage Analytics', date: '2024-01-15', type: 'analytics', status: 'scheduled' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{systemStats.totalUsers}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{systemStats.activeUsers}</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{systemStats.totalClasses}</p>
            <p className="text-sm text-gray-600">Total Classes</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{systemStats.totalAppointments}</p>
            <p className="text-sm text-gray-600">Appointments</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600">{systemStats.averageAttendance}%</p>
            <p className="text-sm text-gray-600">Avg Attendance</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{systemStats.systemUptime}</p>
            <p className="text-sm text-gray-600">System Uptime</p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'login' ? 'bg-blue-500' :
                    activity.type === 'attendance' ? 'bg-green-500' :
                    activity.type === 'appointment' ? 'bg-purple-500' :
                    activity.type === 'user_management' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Server Load</span>
                <span className="text-sm font-medium text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium text-gray-900">62%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Storage</span>
                <span className="text-sm font-medium text-gray-900">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Database Connections</span>
                <span className="text-sm font-medium text-gray-900">23/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '46%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <Button onClick={() => setShowAddUser(true)}>Add New User</Button>
      </div>

      {showAddUser && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput label="Name" placeholder="Enter full name" />
            <FormInput label="Email" type="email" placeholder="Enter email address" />
            <FormInput label="Role" type="select">
              <option value="">Select role...</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </FormInput>
            <FormInput label="Password" type="password" placeholder="Enter password" />
            <FormInput label="USN (for students)" placeholder="Enter USN" />
            <FormInput label="Department (for faculty)" placeholder="Enter department" />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button>Add User</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search users..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Details</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'faculty' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.usn || user.department || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="danger" size="sm">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <Button>Generate New Report</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-sm font-medium text-gray-900">87.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Week</span>
              <span className="text-sm font-medium text-gray-900">85.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-medium text-gray-900">86.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="text-sm font-medium text-gray-900">84.1%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Students</span>
              <span className="text-sm font-medium text-gray-900">1,180</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Faculty</span>
              <span className="text-sm font-medium text-gray-900">65</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Admins</span>
              <span className="text-sm font-medium text-gray-900">5</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Report Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{report.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      report.type === 'attendance' ? 'bg-blue-100 text-blue-800' :
                      report.type === 'performance' ? 'bg-green-100 text-green-800' :
                      report.type === 'faculty' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' :
                      report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm">Download</Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">2024-01-10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <span className="text-sm font-medium text-gray-900">Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-gray-900">PostgreSQL 14</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Backend</span>
              <span className="text-sm font-medium text-gray-900">Node.js 18</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Frontend</span>
              <span className="text-sm font-medium text-gray-900">React 18</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-gray-900">120ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-gray-900">0.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Throughput</span>
                <span className="text-sm font-medium text-gray-900">1,250 req/min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
            { time: '2024-01-15 10:30:45', level: 'INFO', message: 'User John Doe logged in successfully' },
            { time: '2024-01-15 10:28:12', level: 'INFO', message: 'Attendance report generated for Data Structures' },
            { time: '2024-01-15 10:25:33', level: 'WARNING', message: 'High memory usage detected: 78%' },
            { time: '2024-01-15 10:22:15', level: 'INFO', message: 'New user registration: Jane Smith' },
            { time: '2024-01-15 10:20:44', level: 'ERROR', message: 'Database connection timeout' },
            { time: '2024-01-15 10:18:30', level: 'INFO', message: 'System backup completed successfully' },
            { time: '2024-01-15 10:15:22', level: 'INFO', message: 'Faculty Bob Wilson marked attendance' }
          ].map((log, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 border-b border-gray-100 last:border-0">
              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {log.level}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{log.message}</p>
                <p className="text-xs text-gray-500">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'reports':
        return renderReports();
      case 'system':
        return renderSystem();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">System administration and management.</p>
          </div>
          
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['overview', 'users', 'reports', 'system'].map((section) => (
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

export default AdminDashboard;
