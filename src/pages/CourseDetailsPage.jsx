import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    getCourseById,
    getCourseLessons,
    submitPayment,
    getMyPayments,
    getCourseReviews, // <-- 1. استيراد دالة جلب التقييمات
    submitReview      // <-- 2. استيراد دالة إرسال التقييم
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './CourseDetailsPage.css';
import './PaymentForm.css';

const VODAFONE_NUMBER = "01012345678";
const INSTAPAY_ACCOUNT = "user@instapay";

const LoadingSpinner = () => (
    <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
        جارِ التحميل...
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#d8000c', background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.1)', borderRadius: '8px', margin: '2rem' }}>
        حدث خطأ: {message || 'فشل تحميل البيانات'}
    </div>
);

const StarRatingInput = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="stars-input">
            <span>تقييمك: </span>
            {[1, 2, 3, 4, 5].map((star) => (
                <i
                    key={star}
                    className={(hoverRating || rating) >= star ? 'fas fa-star' : 'far fa-star'}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                ></i>
            ))}
        </div>
    );
};

// 3. ✨ مكون جديد لعرض التقييم ✨
const ReviewItem = ({ review }) => {
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '؟';
    };

    return (
        <div className="review-item">
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="avatar">{getInitials(review.user_name)}</div>
                    <div>
                        <h4>{review.user_name || 'طالب'}</h4>
                        <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString('ar-EG')}
                        </span>
                    </div>
                </div>
                <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                        <i key={i} className={i < review.rating ? 'fas fa-star' : 'far fa-star'}></i>
                    ))}
                </div>
            </div>
            <p className="review-comment">{review.comment}</p>
        </div>
    );
};

const PaymentFormModal = ({ course, onClose, onSubmit, isLoading }) => {
    const [paymentMethod, setPaymentMethod] = useState('vodafone_cash');
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [paymentError, setPaymentError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        setScreenshotFile(event.target.files[0]);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!screenshotFile) {
            setPaymentError('يرجى إرفاق صورة إيصال الدفع.');
            return;
        }
        setPaymentError('');
        onSubmit(paymentMethod, screenshotFile, fileInputRef);
    };

    const handleCopyToClipboard = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess(`تم نسخ: ${textToCopy}`);
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Failed to copy: ', err);
            setCopySuccess('فشل النسخ');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="payment-form-overlay">
            <div className="payment-form-modal">
                <button className="close-modal-btn" onClick={onClose} disabled={isLoading}>×</button>

                <div className="payment-header">
                    <h2><i className="fas fa-wallet"></i> إتمام الدفع</h2>
                    <p>للالتحاق بكورس: <strong>{course.title}</strong></p>
                    <div className="payment-price-tag">
                        المبلغ المطلوب: <span>{course.price} ج.م</span>
                    </div>
                </div>

                {paymentError && <p className="payment-error">{paymentError}</p>}
                {copySuccess && <p className="payment-copy-success">{copySuccess}</p>}

                <form onSubmit={handleFormSubmit}>
                    <div className="payment-step">
                        <span className="step-number">1</span>
                        <p>اختر طريقة الدفع وقم بتحويل المبلغ</p>
                    </div>

                    <div className="payment-methods-grid">
                        <label className={`payment-method-card ${paymentMethod === 'vodafone_cash' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="vodafone_cash"
                                checked={paymentMethod === 'vodafone_cash'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                disabled={isLoading}
                            />
                            <div className="payment-method-info vodafone">
                                <span className="payment-method-title">فودافون كاش</span>
                                <div className="payment-copy-box">
                                    <span>{VODAFONE_NUMBER}</span>
                                    <button type="button" onClick={() => handleCopyToClipboard(VODAFONE_NUMBER)} disabled={isLoading}>
                                        <i className="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </label>
                        <label className={`payment-method-card ${paymentMethod === 'instapay' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="instapay"
                                checked={paymentMethod === 'instapay'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                disabled={isLoading}
                            />
                            <div className="payment-method-info instapay">
                                <span className="payment-method-title">انستا باي</span>
                                <div className="payment-copy-box">
                                    <span>{INSTAPAY_ACCOUNT}</span>
                                    <button type="button" onClick={() => handleCopyToClipboard(INSTAPAY_ACCOUNT)} disabled={isLoading}>
                                        <i className="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </label>
                    </div>

                    <div className="payment-step">
                        <span className="step-number">2</span>
                        <p>قم بإرفاق صورة إيصال الدفع</p>
                    </div>

                    <div className="payment-form-group">
                        <label htmlFor="screenshot" className="upload-label">
                            <i className="fas fa-cloud-upload-alt"></i>
                            <span>{screenshotFile ? screenshotFile.name : 'اضغط لاختيار صورة الإيصال'}</span>
                        </label>
                        <input
                            type="file"
                            id="screenshot"
                            name="screenshot"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="payment-submit-btn" disabled={isLoading}>
                        {isLoading ? 'جارِ الإرسال...' : 'تأكيد وإرسال للمراجعة'}
                    </button>
                </form>
            </div>
        </div>
    );
};


function CourseDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoadingCourse, setIsLoadingCourse] = useState(true);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false); // 4. حالة تحميل للتقييمات
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('description');

    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);

    const [newReviewText, setNewReviewText] = useState('');
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState(''); // 5. حالة خطأ لإرسال التقييم
    const [userHasReviewed, setUserHasReviewed] = useState(false); // 6. تتبع هل المستخدم قيّم

    const fetchCourseData = async (forceReload = false) => {
        if (!forceReload) {
            setIsLoadingCourse(true);
            setCourse(null);
            setLessons([]);
            setReviews([]);
        }
        setError('');
        setPaymentSuccess('');
        setActiveTab('description');
        setEnrollmentStatus(null);
        try {
            const response = await getCourseById(id);
            setCourse(response.data.course || null);
        } catch (err) {
            console.error("Failed to fetch course details:", err);
            setError(err.response?.data?.error || 'فشل تحميل تفاصيل الكورس.');
            setCourse(null);
        } finally {
            if (!forceReload) {
                setIsLoadingCourse(false);
            }
        }
    };

    useEffect(() => {
        fetchCourseData(false);
    }, [id]);

    const fetchUserCourseStatus = async () => {
        if (!isAuthenticated || !course || user?.role === 'admin') {
            if (user?.role === 'admin') {
                setEnrollmentStatus('admin');
            }
            return;
        }

        setIsLoadingStatus(true);
        try {
            const response = await getMyPayments();
            const userPayments = response.data.payments || [];
            const latestPaymentForThisCourse = userPayments
                .filter(p => p.course_id === course.course_id)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            [0];

            if (latestPaymentForThisCourse) {
                setEnrollmentStatus(latestPaymentForThisCourse.status);
            } else {
                setEnrollmentStatus('not_enrolled');
            }
        } catch (err) {
            console.error("Failed to fetch payment status:", err);
            setEnrollmentStatus('not_enrolled');
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && course) {
            fetchUserCourseStatus();
        } else if (!isAuthenticated && !authLoading) {
            setEnrollmentStatus('not_authenticated');
        } else if (user?.role === 'admin') {
            setEnrollmentStatus('admin');
        }
    }, [isAuthenticated, course, authLoading, user]);


    const fetchLessonsData = async () => {
        if (lessons.length > 0 || isLoadingLessons) return;
        setIsLoadingLessons(true);
        try {
            const response = await getCourseLessons(id);
            setLessons(response.data.lessons || []);
        } catch (err) {
            console.error("Failed to fetch lessons:", err);
            setLessons([]);
        } finally {
            setIsLoadingLessons(false);
        }
    };

    // 7. ✨ دالة جلب التقييمات (مفعلة) ✨
    const fetchReviewsData = async () => {
        if (isLoadingReviews) return;
        setIsLoadingReviews(true);
        try {
            const response = await getCourseReviews(id);
            const fetchedReviews = response.data.reviews || [];
            setReviews(fetchedReviews);

            // التحقق إذا كان المستخدم الحالي قد قيّم
            if (isAuthenticated && user) {
                const userReview = fetchedReviews.find(r => r.user_id === user.user_id);
                setUserHasReviewed(!!userReview);
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
            setReviews([]);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === 'content') {
            fetchLessonsData();
        }
        if (tab === 'reviews') {
            fetchReviewsData(); // استدعاء الدالة المحدثة
        }
    };

    const handleEnrollClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (user?.role === 'admin') return;

        switch (enrollmentStatus) {
            case 'approved':
                navigate(`/course/${id}/watch`);
                break;
            case 'pending':
                navigate('/my-payments');
                break;
            case 'rejected':
            case 'not_enrolled':
            default:
                setShowPaymentForm(true);
                setPaymentSuccess('');
                break;
        }
    };

    const handlePaymentSubmit = async (paymentMethod, screenshotFile, fileInputRef) => {
        if (!course) return;

        setPaymentSuccess('');
        setIsSubmittingPayment(true);

        const formData = new FormData();
        formData.append('course_id', course.course_id);
        formData.append('amount', course.price);
        formData.append('method', paymentMethod);
        formData.append('screenshot', screenshotFile);

        try {
            const response = await submitPayment(formData);
            setPaymentSuccess(response.data.message || 'تم إرسال طلب الدفع بنجاح وهو قيد المراجعة.');
            setShowPaymentForm(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setEnrollmentStatus('pending');
        } catch (err) {
            console.error("Payment submission failed:", err);
            alert(err.response?.data?.error || 'فشل إرسال طلب الدفع.');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    // 8. ✨ دالة إرسال التقييم (مفعلة) ✨
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError('');

        if (newReviewRating === 0) {
            setReviewError("يرجى اختيار تقييم (عدد النجوم).");
            return;
        }
        if (!newReviewText) {
            setReviewError("يرجى كتابة نص التقييم.");
            return;
        }

        setIsSubmittingReview(true);

        try {
            const response = await submitReview(id, {
                rating: newReviewRating,
                comment: newReviewText
            });

            // إضافة التقييم الجديد يدوياً في بداية القائمة
            const newReview = {
                ...response.data.review,
                user_name: user.name // إضافة اسم المستخدم الحالي للتقييم الجديد
            };
            setReviews([newReview, ...reviews]);

            setNewReviewText('');
            setNewReviewRating(0);
            setUserHasReviewed(true); // تم التقييم

            // تحديث بيانات الكورس (لإظهار متوسط التقييم الجديد)
            fetchCourseData(true);

        } catch (err) {
            console.error("Review submission failed:", err);
            setReviewError(err.response?.data?.error || 'فشل إرسال التقييم.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const getEnrollButtonText = () => {
        if (user?.role === 'admin') return 'الأدمن لا يلتحق بالكورسات';
        if (!isAuthenticated) return 'سجل الدخول للالتحاق';
        if (isLoadingStatus) return 'جارِ التحقق...';

        switch (enrollmentStatus) {
            case 'approved':
                return 'مشاهدة الكورس';
            case 'pending':
                return 'قيد المراجعة (عرض التفاصيل)';
            case 'rejected':
                return 'إعادة محاولة الالتحاق';
            case 'not_enrolled':
            default:
                return 'التحق بالكورس الآن';
        }
    };

    if (isLoadingCourse || authLoading) {
        return (
            <div className="course-details-page">
                <Navbar showBackButton={true} CourcePage={true} />
                <LoadingSpinner />
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="course-details-page">
                <Navbar showBackButton={true} CourcePage={true} />
                <ErrorDisplay message={error} />
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/courses" className="back-btn">العودة للكورسات</Link>
                </div>
            </div>
        );
    }
    if (!course) {
        return (
            <div className="course-details-page">
                <Navbar showBackButton={true} CourcePage={true} />
                <div className="not-found">
                    <h2>الكورس غير موجود</h2>
                    <Link to="/courses" className="back-btn">العودة للكورسات</Link>
                </div>
            </div>
        );
    }

    // 9. ✨ متغير لتحديد هل يمكن للطالب التقييم ✨
    const canReview = (enrollmentStatus === 'approved' || user?.role === 'admin') && !userHasReviewed;

    return (
        <div className="course-details-page">
            <Navbar showBackButton={true} CourcePage={true} />

            <div className="course-header">
                {paymentSuccess && <p className="payment-success-banner">{paymentSuccess}</p>}
                <div className="course-header-content">
                    <div className="course-header-text">
                        <div className="breadcrumb">
                            <Link to="/courses">الكورسات</Link> / <span>{course.category}</span>
                        </div>
                        <h1>{course.title}</h1>
                        <p className="course-subtitle">{course.description}</p>
                        <div className="course-stats-row">
                            <span className="stat">⭐ {course.rating?.toFixed(1) || '0.0'} ({course.reviews_count || 0})</span>
                            <span className="stat">👥 {course.students_count || 0}</span>
                            <span className="stat">🕐 {course.duration || '-'}</span>
                            <span className="stat">📊 {course.level || '-'}</span>
                        </div>
                        <div className="course-highlights">
                            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>🎯 ما ستتعلمه:</h3>
                            <ul className="highlights-list">
                                {(course.what_you_learn || []).slice(0, 3).map((item, index) => <li key={index}>✓ {item}</li>)}
                                {(course.what_you_learn?.length || 0) > 3 && <li>... والمزيد</li>}
                                {(course.what_you_learn || []).length === 0 && <li>سيتم إضافة التفاصيل.</li>}
                            </ul>
                        </div>
                        <div className="instructor-info" style={{ marginTop: '1.5rem' }}>
                            <span>👨‍🏫 المدرب: <strong>{course.instructor || '-'}</strong></span>
                        </div>
                    </div>
                    <div className="course-header-card">
                        <img src={course.thumbnail_url || '/images/placeholder.png'} alt={course.title} onError={(e) => e.target.src = '/images/placeholder.png'} />
                        <div className="price-card">
                            <div className="price-info">
                                <span className="current-price">{course.price} ج.م</span>
                                {course.original_price && course.original_price > course.price && (
                                    <>
                                        <span className="original-price">{course.original_price} ج.م</span>
                                        <span className="discount">خصم {Math.round((1 - course.price / course.original_price) * 100)}%</span>
                                    </>
                                )}
                            </div>
                            <button className="enroll-btn" onClick={handleEnrollClick} disabled={isLoadingStatus || user?.role === 'admin'}>
                                {getEnrollButtonText()}
                            </button>
                            <p className="guarantee">✓ ضمان استرجاع المال خلال 30 يوم

                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showPaymentForm && (
                <PaymentFormModal
                    course={course}
                    onClose={() => setShowPaymentForm(false)}
                    onSubmit={handlePaymentSubmit}
                    isLoading={isSubmittingPayment}
                />
            )}

            <div className="course-body">
                <div className="tabs">
                    <button className={`tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => handleTabClick('description')}>الوصف</button>
                    <button className={`tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => handleTabClick('content')}>المحتوى</button>
                    <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabClick('reviews')}>التقييمات</button>
                    <button className={`tab ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => handleTabClick('faq')}>الأسئلة</button>
                </div>
                <div className="tab-content">
                    {activeTab === 'description' && (
                        <div className="description-tab">
                            <div className="description-card">
                                <h2>📖 عن الكورس</h2>
                                <p className="description-text">{course.detailed_description || course.description}</p>
                            </div>
                            <div className="what-you-learn-card">
                                <h3>🎓 ماذا ستتعلم؟</h3>
                                <ul className="learn-list">
                                    {(course.what_you_learn || []).map((item, index) => <li key={index}><span className="check-icon">✓</span><span>{item}</span></li>)}
                                    {(course.what_you_learn || []).length === 0 && <li>سيتم إضافة التفاصيل.</li>}
                                </ul>
                            </div>
                            <div className="topics-card">
                                <h3>📚 المواضيع</h3>
                                <div className="topics-grid">
                                    {(course.topics || []).map((topic, index) => <div key={index} className="topic-item"><span className="topic-icon">📌</span><span>{topic}</span></div>)}
                                    {(course.topics || []).length === 0 && <div>سيتم إضافة التفاصيل.</div>}
                                </div>
                            </div>
                            <div className="requirements-card">
                                <h3>⚙️ المتطلبات</h3>
                                <ul className="requirements-list">
                                    {(course.requirements || []).map((req, index) => <li key={index}>{req}</li>)}
                                    {(course.requirements || []).length === 0 && <li>لا توجد متطلبات.</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                    {activeTab === 'content' && (
                        <div className="content-tab">
                            <h2>محتوى الكورس</h2>
                            <p className="content-info">{course.lessons_count ?? lessons.length} درس • {course.duration || '-'}</p>
                            {isLoadingLessons && <LoadingSpinner />}
                            {!isLoadingLessons && error && activeTab === 'content' && <ErrorDisplay message={error} />}
                            {!isLoadingLessons && !error && (
                                <div className="lessons-list">
                                    {lessons.map((lesson, index) => (
                                        <div key={lesson.lesson_id} className="lesson-item">
                                            <div className="lesson-number">{index + 1}</div>
                                            <div className="lesson-info">
                                                <h4>{lesson.title}</h4>
                                                <span className="lesson-duration">🕐 {lesson.duration || '-'}</span>
                                            </div>
                                            {lesson.is_accessible ? (
                                                <button className="preview-btn" onClick={() => navigate(`/course/${course.course_id}/watch`, { state: { lessonId: lesson.lesson_id } })}>
                                                    <i className="fas fa-play-circle"></i> مشاهدة
                                                </button>
                                            ) : (
                                                <button className="preview-btn locked" disabled>
                                                    <i className="fas fa-lock"></i> مشاهدة
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {lessons.length === 0 && !isLoadingLessons && <p>سيتم إضافة الدروس.</p>}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="reviews-tab-content">
                            <h2><i className="fas fa-star"></i> تقييمات الطلاب</h2>

                            {/* 10. ✨ تفعيل فورم التقييم ✨ */}
                            {canReview && (
                                <form className="add-review-form" onSubmit={handleReviewSubmit}>
                                    <h3><i className="fas fa-plus-circle"></i> أضف تقييمك</h3>
                                    {reviewError && <p className="payment-error">{reviewError}</p>}
                                    <StarRatingInput rating={newReviewRating} setRating={setNewReviewRating} />
                                    <textarea
                                        placeholder="اكتب مراجعتك هنا..."
                                        rows="4"
                                        value={newReviewText}
                                        onChange={(e) => setNewReviewText(e.target.value)}
                                        disabled={isSubmittingReview}
                                    ></textarea>
                                    <button type="submit" className="submit-review-btn" disabled={isSubmittingReview}>
                                        {isSubmittingReview ? 'جارِ الإرسال...' : 'إرسال التقييم'}
                                    </button>
                                </form>
                            )}
                            {/* إظهار رسالة إذا كان الطالب مسجل ولكنه قيّم بالفعل */}
                            {enrollmentStatus === 'approved' && userHasReviewed && (
                                <p className="payment-success-banner" style={{ marginBottom: '2rem' }}>شكراً لك، لقد قمت بتقييم هذا الكورس بالفعل.</p>
                            )}

                            <div className="reviews-list">
                                {isLoadingReviews && <LoadingSpinner />}
                                {!isLoadingReviews && reviews.length === 0 && (
                                    <p>لا توجد تقييمات لهذا الكورس حتى الآن.</p>
                                )}
                                {/* 11. ✨ عرض التقييمات ✨ */}
                                {!isLoadingReviews && reviews.length > 0 && (
                                    reviews.map(review => (
                                        <ReviewItem key={review.review_id} review={review} />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'faq' && (
                        <div className="faq-tab">
                            <h2>الأسئلة الشائعة</h2>
                            <div className="faq-list">
                                {(course.faqs || []).map((faq, index) => (
                                    <div key={index} className="faq-item">
                                        <h4>❓ {faq.question}</h4>
                                        <p>{faq.answer}</p>
                                    </div>
                                ))}
                                {(course.faqs || []).length === 0 && <p>لا توجد أسئلة شائعة.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseDetailsPage;