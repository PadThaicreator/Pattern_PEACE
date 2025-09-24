import { useState } from 'react';
import styles from './Auth.module.css';

export const LoginForm = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
    alert('Login Success!');
    onNavigate('homepage');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>อีเมล</label>
            <input
              type="email"
              name="email"
              className={styles.formInput}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              className={styles.formInput}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={`btn btn-primary`}>
            เข้าสู่ระบบ
          </button>
        </form>
        <div className={styles.authSwitch}>
          ยังไม่มีบัญชี? <a href="#" onClick={() => onNavigate('register')} className={styles.authLink}>สมัครสมาชิก</a>
        </div>
      </div>
    </div>
  );
};

export const RegisterForm = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }
    // Add registration logic here
    alert('Register Success!');
    onNavigate('login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>สมัครสมาชิก</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ชื่อ</label>
            <input
              type="text"
              name="name"
              className={styles.formInput}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>อีเมล</label>
            <input
              type="email"
              name="email"
              className={styles.formInput}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              className={styles.formInput}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              name="confirmPassword"
              className={styles.formInput}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={`btn btn-primary`}>
            สมัครสมาชิก
          </button>
        </form>
        <div className={styles.authSwitch}>
          มีบัญชีอยู่แล้ว? <a href="#" onClick={() => onNavigate('login')} className={styles.authLink}>เข้าสู่ระบบ</a>
        </div>
      </div>
    </div>
  );
};