import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar({ showBackButton = false, CourcePage = false, showThemeToggle = true }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path.startsWith('#') && location.pathname === '/') {
      return location.hash === path ? 'active' : '';
    }
    if (path.startsWith('/nova#') && location.pathname === '/nova') {
      return location.hash === path.substring(5) ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  const renderNavLinks = () => {

    if (!isLoading && isAuthenticated && user?.role === 'admin') {
      return (
        <>
          <Link to="/courses" className={isActive('/courses')} onClick={closeMenu}>الكورسات</Link>
          <Link to="/" className="back-button" onClick={closeMenu}>← العودة لـ Evolve</Link>
          <Link to="/admin/dashboard" className={isActive('/admin/dashboard')} onClick={closeMenu}>لوحة التحكم</Link>
          <Link to="/admin/courses" className={isActive('/admin/courses')} onClick={closeMenu}>إدارة الكورسات</Link>          
          <Link to="/admin/manage-payments" className={isActive('/admin/manage-payments')} onClick={closeMenu}>إدارة المدفوعات</Link>
          <button onClick={handleLogout} className="logout-button">تسجيل الخروج</button>
        </>
      );
    }

    const evolveLinks = (
      <>
        <a href="/#home" className={isActive('#home')} onClick={closeMenu}>الرئيسية</a>
        <a href="/#about" className={isActive('#about')} onClick={closeMenu}>عن Evolve</a>
        <Link to="/nova" className={isActive('/nova')} onClick={closeMenu}>NOVA</Link>
        <a href="/#events" className={isActive('#events')} onClick={closeMenu}>الفعاليات</a>
        <Link to="/courses" className={isActive('/courses')} onClick={closeMenu}>الكورسات</Link>
        <a href="/#contact" className={isActive('#contact')} onClick={closeMenu}>تواصل معنا</a>
      </>
    );

    const novaLinks = (
      <>
        <a href="/nova#home" className={isActive('/nova#home')} onClick={closeMenu}>الرئيسية</a>
        <a href="/nova#about" className={isActive('/nova#about')} onClick={closeMenu}>عن Nova</a>
        <Link to="/courses" className={isActive('/courses')} onClick={closeMenu}>الكورسات</Link>
        <a href="/nova#events" className={isActive('/nova#events')} onClick={closeMenu}>الفعاليات</a>
        <a href="/nova#contact" className={isActive('/nova#contact')} onClick={closeMenu}>تواصل معنا</a>
        <Link to="/" className="back-button" onClick={closeMenu}>
          ← العودة لـ Evolve
        </Link>
      </>
    );

    const courseLinks = (
      <>
        <Link to="/courses" className={isActive('/courses')} onClick={closeMenu}>الكورسات</Link>
        <Link to="/" className="back-button" onClick={closeMenu}>
          ← العودة لـ Evolve
        </Link>
      </>
    );

    let linksToShow;
    if (CourcePage || location.pathname.startsWith('/course') || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/my-payments' || location.pathname === '/profile') {
      linksToShow = courseLinks;
    } else if (showBackButton || location.pathname === '/nova') {
      linksToShow = novaLinks;
    } else {
      linksToShow = evolveLinks;
    }

    return (
      <>
        {linksToShow}
        {!isLoading && (
          isAuthenticated ? (
            <>
              <Link to="/profile" className={isActive('/profile')} onClick={closeMenu}>ملفي الشخصي</Link>
              {user && user.role === 'student' && (
                <Link to="/my-payments" className={isActive('/my-payments')} onClick={closeMenu}>مدفوعاتي</Link>
              )}
              <button onClick={handleLogout} className="logout-button">تسجيل الخروج</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`login-button ${isActive('/login')}`} onClick={closeMenu}>تسجيل الدخول</Link>
              <Link to="/register" className={`register-button ${isActive('/register')}`} onClick={closeMenu}>إنشاء حساب</Link>
            </>
          )
        )}
      </>
    );
  };

  return (
    <header className="navbar">
      <Link to="/" onClick={closeMenu}>
        <img src="/images/NavLogo.png" alt="logo" className="logo" />
      </Link>

      <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
        {renderNavLinks()}
        {showThemeToggle && (
            <button onClick={toggleTheme} className="theme-toggle" title={isDarkMode ? 'الوضع الفاتح' : 'الوضع المظلم'}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;