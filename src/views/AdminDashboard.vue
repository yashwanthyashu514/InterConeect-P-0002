<template>
  <div class="dashboard layout admin-theme">
    <aside class="sidebar">
      <div class="logo">AttendEase <span class="badge">Admin</span></div>
      <nav>
        <a href="#" class="active">Systems Overview</a>
        <a href="#">Manage Users</a>
        <a href="#">Manage Subjects</a>
        <a href="#">System Settings</a>
      </nav>
      <div class="logout">
        <router-link to="/login">Logout</router-link>
      </div>
    </aside>
    <main class="content">
      <header>
        <h2>Administrator Console</h2>
       </header>
      
      <div class="grid-stats">
        <div class="info-card">
          <div class="icon purple">👥</div>
          <div class="data">
            <h4>Total Students</h4>
            <p>1,245</p>
          </div>
        </div>
        <div class="info-card">
          <div class="icon orange">👨‍🏫</div>
          <div class="data">
            <h4>Total Faculty</h4>
            <p>84</p>
          </div>
        </div>
        <div class="info-card">
          <div class="icon green">📚</div>
          <div class="data">
            <h4>Active Courses</h4>
            <p>156</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #0f172a; /* Dark theme for admin */
  font-family: 'Inter', sans-serif;
  color: #e2e8f0;
}

.sidebar {
  width: 250px;
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.logo {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background: #9333ea;
  color: #fff;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

nav a {
  text-decoration: none;
  color: #94a3b8;
  font-weight: 500;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  transition: all 0.2s;
}

nav a:hover, nav a.active {
  background: #334155;
  color: #f8fafc;
}

.logout a {
  color: #ef4444;
  text-decoration: none;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 2rem 3rem;
}

header h2 {
  color: #f8fafc;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.grid-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
}

.icon.purple { background: rgba(147, 51, 234, 0.2); }
.icon.orange { background: rgba(249, 115, 22, 0.2); }
.icon.green { background: rgba(34, 197, 94, 0.2); }

.data h4 {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.data p {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}
</style>
