import { Link, useLocation, Outlet } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { id: 'login', label: 'Login', path: '/login' },
    { id: 'register', label: 'Register', path: '/register' },
    { id: '/', label: 'Home', path: '/' },
    { id: 'history', label: 'History', path: '/history' },
    { id: 'report', label: 'Report', path: '/report' },
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src="/logo.png" alt="Logo" className={styles.logoImage} />
          </div>
        </div>
        <div className={styles.navMenu}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className={styles.userAvatar}></div>
      </div>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Navbar;