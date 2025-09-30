import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut } from 'lucide-react';
import { logout } from '../../redux/userSlice';

const Navbar = () => {
  const location = useLocation();


  const navItems = [
    // { id: 'login', label: 'Login', path: '/login' },
    // { id: 'register', label: 'Register', path: '/register' },
    { id: '/', label: 'Home', path: '/' },
    { id: 'history', label: 'History', path: '/history' },
    { id: 'report', label: 'Report', path: '/report' },
  ];

  const user = useSelector((state)=> state.user.user)

  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogOut = async () =>{
    localStorage.removeItem("jwt")
    dispatch(logout())
    navigate("/login")
  }

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
        <div className='flex items-center justify-center gap-3 p-2 px-5 rounded-2xl bg-gray-200'>
          <p>{user.name}</p>
          <div onClick={(e)=>{
            e.stopPropagation();
            handleLogOut();
          }}
          >
            <LogOut size={18} color='red'  />
          </div>
          
          <div className={styles.userAvatar}></div>
        </div>
      </div>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Navbar;