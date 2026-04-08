<template>
  <div class="dashboard layout">
    <aside class="sidebar">
      <div class="logo">AttendEase</div>
      <nav>
        <a href="#" class="active">Overview</a>
        <a href="#">My Attendance</a>
        <a href="#">Classes</a>
        <a href="#">Settings</a>
      </nav>
      <div class="logout">
        <router-link to="/login">Logout</router-link>
      </div>
    </aside>
    <main class="content">
      <header>
        <h2>Student Dashboard</h2>
        <div class="profile">Student Profile</div>
      </header>
      <section class="stats">
        <div class="stat-card">
          <h3>Overall Attendance</h3>
          <div class="value green">85%</div>
        </div>
        <div class="stat-card">
          <h3>Classes Attended</h3>
          <div class="value">102/120</div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f4f7fe;
  font-family: 'Inter', sans-serif;
}

.sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2b3674;
  margin-bottom: 3rem;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

nav a {
  text-decoration: none;
  color: #a3aed1;
  font-weight: 500;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  transition: all 0.2s;
}

nav a:hover, nav a.active {
  background: #4318ff;
  color: #fff;
}

.logout a {
  color: #ff5b5b;
  text-decoration: none;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 2rem 3rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

header h2 {
  color: #2b3674;
  font-size: 2rem;
}

.stat-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 5px 14px rgba(0,0,0,0.02);
  display: inline-block;
  min-width: 200px;
  margin-right: 1.5rem;
}

.stat-card h3 {
  font-size: 0.9rem;
  color: #a3aed1;
  margin-bottom: 0.5rem;
}

.stat-card .value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2b3674;
}

.stat-card .value.green {
  color: #05cd99;
}
</style>
