<template>
  <div class="dashboard layout">
    <aside class="sidebar faculty-theme">
      <div class="logo">AttendEase <span class="badge">Faculty</span></div>
      <nav>
        <a href="#" class="active">Daily Schedule</a>
        <a href="#">Mark Attendance</a>
        <a href="#">Reports</a>
      </nav>
      <div class="logout">
        <router-link to="/login">Logout</router-link>
      </div>
    </aside>
    <main class="content">
      <header>
        <h2>Faculty Dashboard</h2>
      </header>
      <section class="card-area">
        <div class="card bg-gradient">
          <h3>Mark Today's Attendance</h3>
          <p>CS101 - Intro to Programming</p>
          <button class="action-btn">Start Marking</button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Inheriting structural styles similar to student, but with different colors */
.layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Inter', sans-serif;
}

.sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.logo {
  font-size: 1.2rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background: #e6f2ff;
  color: #0066cc;
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
  color: #6c757d;
  font-weight: 500;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  transition: all 0.2s;
}

nav a:hover, nav a.active {
  background: #0066cc;
  color: #fff;
}

.logout a {
  color: #dc3545;
  text-decoration: none;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 2rem 3rem;
}

header h2 {
  color: #343a40;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.card {
  padding: 2rem;
  border-radius: 20px;
  color: white;
  max-width: 400px;
}

.bg-gradient {
  background: linear-gradient(135deg, #0066cc, #0099ff);
  box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2);
}

.card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.card p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.action-btn {
  background: #fff;
  color: #0066cc;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
}
</style>
