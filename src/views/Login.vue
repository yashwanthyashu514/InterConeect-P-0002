<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Welcome Back</h2>
      <p class="subtitle">Enter your credentials to access your portal</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="role">Role</label>
          <select id="role" v-model="role" class="input-style">
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" class="input-style" placeholder="john@example.com" required>
        </div>
        
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" class="input-style" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" required>
        </div>

        <button type="submit" class="login-btn">Sign In</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      role: 'student',
      email: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      // In a real app, you would authenticate here.
      // For now, we just route based on the role.
      if (this.role === 'student') this.$router.push('/student-dashboard');
      if (this.role === 'faculty') this.$router.push('/faculty-dashboard');
      if (this.role === 'admin') this.$router.push('/admin-dashboard');
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #12121c, #1f1f33);
  font-family: 'Inter', sans-serif;
  color: #fff;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #e0e0ff;
}

.subtitle {
  text-align: center;
  color: #8a8a9e;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.85rem;
  color: #a0a0bd;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-style {
  padding: 1rem 1.2rem;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.input-style:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
  background: rgba(0, 0, 0, 0.4);
}

.input-style option {
  background: #1f1f33;
  color: #fff;
}

.login-btn {
  margin-top: 1rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.6);
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
