import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import Navbar from '../components/Navbar';
import './AuthPage.css';

// --- ✨ دالة مساعدة للتحقق من الإيميل ✨ ---
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // --- ✨ حالات جديدة للأخطاء الفورية ✨ ---
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // --- ✨ حالة جديدة لمتطلبات كلمة المرور ✨ ---
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const [apiError, setApiError] = useState(''); // خطأ من السيرفر
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- ✨ دالة التحقق من كلمة المرور (Live) ✨ ---
  const validatePassword = (pass) => {
    const length = pass.length >= 8;
    const lowercase = /[a-z]/.test(pass);
    const uppercase = /[A-Z]/.test(pass);
    const number = /\d/.test(pass);
    const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    setPasswordCriteria({ length, lowercase, uppercase, number, specialChar });
    
    return length && lowercase && uppercase && number && specialChar;
  };

  // --- ✨ useEffect لمراقبة حقل كلمة المرور ✨ ---
  useEffect(() => {
    if (password) {
      validatePassword(password);
    }
  }, [password]);
  
  // --- ✨ useEffect لمراقبة حقل تأكيد كلمة المرور ✨ ---
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('كلمتا المرور غير متطابقتين.');
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  // --- ✨ دالة للتحقق من الفورم بالكامل قبل الإرسال ✨ ---
  const validateForm = () => {
    let isValid = true;
    
    // 1. التحقق من الاسم
    if (!name || name.trim().length < 3) {
      setNameError('الاسم يجب أن يكون 3 أحرف على الأقل.');
      isValid = false;
    } else {
      setNameError('');
    }

    // 2. التحقق من الإيميل
    if (!email || !validateEmail(email)) {
      setEmailError('البريد الإلكتروني غير صالح.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // 3. التحقق من كلمة المرور
    const isPasswordValid = validatePassword(password);
    if (!isPasswordValid) {
      setPasswordError('كلمة المرور لا تستوفي جميع المتطلبات.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // 4. التحقق من تطابق كلمة المرور
    if (!confirmPassword || password !== confirmPassword) {
      setConfirmPasswordError('كلمتا المرور غير متطابقتين.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    // --- ✨ تشغيل التحقق قبل الإرسال ✨ ---
    if (!validateForm()) {
      return; // إيقاف الإرسال إذا كان الفورم غير صالح
    }
    
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      setSuccess('تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة الدخول...');
      setTimeout(() => {
          navigate('/login');
      }, 2000);
    } catch (err) {
      // إظهار الخطأ القادم من السيرفر (مثل: إيميل مستخدم)
      setApiError(err.response?.data?.error || 'فشل إنشاء الحساب. قد يكون البريد الإلكتروني مستخدماً.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar showBackButton={true} CourcePage={true} isDark={true} />
      <div className="auth-container">
        <div className="auth-form-container">
          <h1 className="auth-title">إنشاء حساب جديد</h1>
          <p className="auth-subtitle">انضم إلينا وابدأ رحلتك التعليمية.</p>
          
          {/* --- ✨ عرض أخطاء السيرفر أو رسالة النجاح ✨ --- */}
          {apiError && <p className="auth-error">{apiError}</p>}
          {success && <p className="auth-success">{success}</p>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={name}
                // ✨ إضافة كلاس .invalid عند وجود خطأ ✨
                className={nameError ? 'invalid' : ''}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.length >= 3) setNameError('');
                }}
                required
                disabled={loading}
              />
              {/* ✨ إظهار الخطأ الخاص بالحقل ✨ */}
              {nameError && <div className="field-error">{nameError}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                className={emailError ? 'invalid' : ''}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validateEmail(e.target.value)) setEmailError('');
                }}
                required
                disabled={loading}
              />
              {emailError && <div className="field-error">{emailError}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                className={passwordError ? 'invalid' : ''}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
                disabled={loading}
              />
              {/* ✨ إظهار الخطأ الخاص بالحقل ✨ */}
              {passwordError && <div className="field-error">{passwordError}</div>}
            </div>
            
            {/* --- ✨ قائمة متطلبات كلمة المرور ✨ --- */}
            {password && (
              <ul className="auth-requirements">
                <li className={passwordCriteria.length ? 'valid' : 'invalid'}>
                  <i className={`fas ${passwordCriteria.length ? 'fa-check' : 'fa-times'}`}></i>
                  8 أحرف على الأقل
                </li>
                <li className={passwordCriteria.lowercase ? 'valid' : 'invalid'}>
                  <i className={`fas ${passwordCriteria.lowercase ? 'fa-check' : 'fa-times'}`}></i>
                  حرف صغير واحد على الأقل (a-z)
                </li>
                <li className={passwordCriteria.uppercase ? 'valid' : 'invalid'}>
                  <i className={`fas ${passwordCriteria.uppercase ? 'fa-check' : 'fa-times'}`}></i>
                  حرف كبير واحد على الأقل (A-Z)
                </li>
                <li className={passwordCriteria.number ? 'valid' : 'invalid'}>
                  <i className={`fas ${passwordCriteria.number ? 'fa-check' : 'fa-times'}`}></i>
                  رقم واحد على الأقل (0-9)
                </li>
                <li className={passwordCriteria.specialChar ? 'valid' : 'invalid'}>
                  <i className={`fas ${passwordCriteria.specialChar ? 'fa-check' : 'fa-times'}`}></i>
                  رمز خاص واحد على الأقل (!@#...)
                </li>
              </ul>
            )}
            
            <div className="form-group">
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={confirmPassword}
                className={confirmPasswordError ? 'invalid' : ''}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              {/* ✨ إظهار الخطأ الخاص بالحقل ✨ */}
              {confirmPasswordError && <div className="field-error">{confirmPasswordError}</div>}
            </div>
            
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'جارِ الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>
          <p className="auth-switch">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;