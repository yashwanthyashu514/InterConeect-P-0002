<template>
  <div class="home-container">
    <div class="hero">
      <h1 class="title">Welcome to AttendEase</h1>
      <p class="subtitle">Streamlining attendance for students, faculty, and admins.</p>
      <div class="actions">
        <router-link to="/login" class="btn primary">Login Now</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2f, #2a2a40);
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.hero {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  animation: fadeIn 1s ease-out;
}

.title {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  color: #a0a0b0;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn.primary {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: #fff;
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.6);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
