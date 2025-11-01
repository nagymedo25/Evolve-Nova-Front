import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getCourseById, getCourseLessons } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
// لا حاجة لـ ReactPlayer
import './CourseWatchPage.css';

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

function CourseWatchPage() {
  const { id: courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [showReviews, setShowReviews] = useState(false);

  // إعادة تفعيل المحاكاة بالوقت
  const [videoWatchedPercent, setVideoWatchedPercent] = useState(0);
  const videoEndTimerRef = useRef(null);


  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      setIsLoadingData(true);
      setError('');
      setCourse(null);
      setLessons([]);
      setCurrentLesson(null);

      if (!isAuthenticated) {
          setError("يجب تسجيل الدخول لمشاهدة الكورس.");
          setIsLoadingData(false);
          setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1500);
          return;
      }

      try {
        const courseResponse = await getCourseById(courseId);
        const fetchedCourse = courseResponse.data.course;
        setCourse(fetchedCourse || null);

        if (!fetchedCourse) {
            throw new Error("الكورس غير موجود.");
        }

        const lessonsResponse = await getCourseLessons(courseId);
        const fetchedLessons = lessonsResponse.data.lessons || [];
        setLessons(fetchedLessons);
        
        const fetchedCompleted = []; // مؤقتاً
        setCompletedLessons(fetchedCompleted);


        const initialLessonId = location.state?.lessonId;
        let lessonToSet = null;
        if (initialLessonId) {
            lessonToSet = fetchedLessons.find(l => l.lesson_id === initialLessonId && l.is_accessible);
        }
        if (!lessonToSet) {
             lessonToSet = fetchedLessons.find(l => l.is_accessible);
        }
        if (!lessonToSet && fetchedLessons.length > 0) {
            lessonToSet = fetchedLessons[0];
        }

        setCurrentLesson(lessonToSet);

         if (!lessonToSet && fetchedLessons.length === 0) {
            console.warn("No lessons found for this course.");
         } else if (lessonToSet && !lessonToSet.is_accessible && user?.role !== 'admin') {
              setError("ليس لديك صلاحية الوصول لهذا الدرس. تأكد من إتمام الدفع أو تواصل مع الدعم.");
         }

      } catch (err) {
        console.error("Failed to load course/lessons:", err);
         if (err.response?.status === 403 || err.response?.status === 401) {
             setError("ليس لديك صلاحية الوصول لهذا الكورس. تأكد من إتمام عملية الدفع.");
         } else if (err.message === "الكورس غير موجود" || err.response?.status === 404) {
             setError("الكورس المطلوب غير موجود.");
         }
         else {
            setError(err.response?.data?.error || err.message || 'فشل تحميل بيانات الكورس.');
         }
        setCourse(null);
        setLessons([]);
        setCurrentLesson(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [courseId, isAuthenticated, authLoading, navigate, location.state]);


  // إعادة تفعيل مؤقت محاكاة مشاهدة الفيديو
  useEffect(() => {
     setVideoWatchedPercent(0); // إعادة تعيين عند تغيير الدرس
     if (videoEndTimerRef.current) clearTimeout(videoEndTimerRef.current);
     
     if (currentLesson && !completedLessons.includes(currentLesson.lesson_id)) {
        // محاكاة وقت المشاهدة (5 ثواني كمثال)
        videoEndTimerRef.current = setTimeout(() => {
            setVideoWatchedPercent(100); // محاكاة اكتمال المشاهدة
        }, 5000); // 5 ثواني
     } else if (currentLesson && completedLessons.includes(currentLesson.lesson_id)){
         setVideoWatchedPercent(100); // مكتمل بالفعل
     }

     return () => clearTimeout(videoEndTimerRef.current);

  }, [currentLesson, completedLessons]);


  const handleLessonClick = (lesson) => {
    if (lesson.is_accessible) {
      setCurrentLesson(lesson);
      setError('');
    } else {
        setError("هذا الدرس غير متاح لك حالياً.");
    }
  };

  const handleMarkComplete = () => {
    if (currentLesson && !completedLessons.includes(currentLesson.lesson_id)) {
      const newCompleted = [...completedLessons, currentLesson.lesson_id];
      setCompletedLessons(newCompleted);

      // TODO: إرسال تحديث الإكمال للباك اند لاحقاً

      if (newCompleted.length === lessons.length) {
        console.log("Course completed!");
      } else {
          handleNextLesson(true);
      }
    }
  };

  const handleNextLesson = (forceMoveNext = false) => {
    if (!lessons || lessons.length === 0) return;

    const currentIndex = lessons.findIndex(l => l.lesson_id === currentLesson?.lesson_id);

    if (currentIndex < lessons.length - 1) {
        let nextLessonIndex = currentIndex + 1;
        while(nextLessonIndex < lessons.length && !lessons[nextLessonIndex].is_accessible) {
            nextLessonIndex++;
        }

        if (nextLessonIndex < lessons.length) {
            if (currentLesson && !completedLessons.includes(currentLesson.lesson_id) && !forceMoveNext) {
                setCompletedLessons([...completedLessons, currentLesson.lesson_id]);
            }
            const nextLesson = lessons[nextLessonIndex];
            setCurrentLesson(nextLesson);
        } else {
             if (currentLesson && !completedLessons.includes(currentLesson.lesson_id)) {
                 const finalCompleted = [...completedLessons, currentLesson.lesson_id];
                 setCompletedLessons(finalCompleted);
                 if (finalCompleted.length === lessons.length) {
                     // اكتمل الكورس
                 }
             }
        }
    } else if (currentLesson && !completedLessons.includes(currentLesson.lesson_id)) {
         const finalCompleted = [...completedLessons, currentLesson.lesson_id];
         setCompletedLessons(finalCompleted);
         if (finalCompleted.length === lessons.length) {
             // اكتمل الكورس
         }
    }
  };


  const progress = lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0;
  const isCompleted = lessons.length > 0 && completedLessons.length === lessons.length;

  if (isLoadingData || authLoading) {
    return (
      <div className="course-watch-page">
        <Navbar showBackButton={true} CourcePage={true} isDark={true} />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-watch-page">
        <Navbar showBackButton={true} CourcePage={true} isDark={true} />
        <ErrorDisplay message={error} />
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to={`/course/${courseId}`} className="back-btn">العودة لتفاصيل الكورس</Link>
          {' | '}
          <Link to="/courses" className="back-btn">العودة لكل الكورسات</Link>
        </div>
      </div>
    );
  }

   if (!course || !currentLesson) {
     return (
       <div className="course-watch-page">
         <Navbar showBackButton={true} CourcePage={true} isDark={true} />
         <div className="not-found">
           <h2>لا يمكن عرض الكورس أو الدروس حالياً.</h2>
           <Link to="/courses" className="back-btn">العودة للكورسات</Link>
         </div>
       </div>
     );
   }

  return (
    <div className="course-watch-page">
      <Navbar showBackButton={true} CourcePage={true} isDark={true} />
      <div className="watch-header">
        <Link to={`/course/${course.course_id}`} className="back-link">← العودة لتفاصيل الكورس</Link>
        <h2>{course.title}</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">{Math.round(progress)}% مكتمل ({completedLessons.length}/{lessons.length} درس)</p>
      </div>

      <div className="watch-content">
        <div className="video-section">
           {currentLesson.video_url ? (
               <div className="video-player">
                 {/* --- العودة إلى IFRAME --- */}
                 <iframe
                   key={currentLesson.lesson_id}
                   src={currentLesson.video_url}
                   title={currentLesson.title}
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 ></iframe>
               </div>
           ) : (
                <div className="video-player-placeholder">
                    لا يوجد فيديو لهذا الدرس.
                </div>
           )}


          <div className="video-info">
            <h1>{currentLesson.title}</h1>
            <div className="video-controls">
              <button
                className="complete-btn"
                onClick={handleMarkComplete}
                // استخدام الحالة القديمة المبنية على الوقت
                disabled={videoWatchedPercent < 100 || completedLessons.includes(currentLesson.lesson_id)}
              >
                {completedLessons.includes(currentLesson.lesson_id) ? '✓ مكتمل' : 'وضع علامة كمكتمل'}
              </button>
              <button className="next-btn" onClick={() => handleNextLesson(false)}>
                الدرس التالي →
              </button>
            </div>
          </div>

          <div className="lesson-tabs">
            <button
              className={`lesson-tab ${!showReviews ? 'active' : ''}`}
              onClick={() => setShowReviews(false)}
            >
              عن الدرس
            </button>
          </div>

          <div className="lesson-tab-content">
            {!showReviews ? (
              <div className="lesson-description">
                <h3>تفاصيل الدرس</h3>
                <p>{currentLesson.description || `في هذا الدرس سنتعلم ${currentLesson.title} بشكل عملي ومفصل.`}</p>
                <div className="lesson-meta">
                  <span>⏱️ المدة: {currentLesson.duration || 'غير محدد'}</span>
                  <span>📊 المستوى: {course.level || 'غير محدد'}</span>
                </div>
              </div>
            ) : (
               <div className="reviews-section">
                 <h3>التقييمات ({course.reviews_count || 0})</h3>
                  <p>سيتم عرض التقييمات هنا قريباً.</p>
               </div>
            )}
          </div>
        </div>

        <div className="playlist-section">
          <div className="playlist-header">
            <h3>محتوى الكورس</h3>
            <p>{lessons.length} درس • {course.duration || 'غير محدد'}</p>
          </div>

          <div className="playlist">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.lesson_id}
                className={`playlist-item ${currentLesson?.lesson_id === lesson.lesson_id ? 'active' : ''} ${completedLessons.includes(lesson.lesson_id) ? 'completed' : ''} ${!lesson.is_accessible ? 'locked' : ''}`}
                onClick={() => handleLessonClick(lesson)}
                title={!lesson.is_accessible ? "هذا الدرس غير متاح لك" : lesson.title}
              >
                <div className="playlist-number">{index + 1}</div>
                <div className="playlist-info">
                  <h4>{lesson.title}</h4>
                  <span className="playlist-duration">{lesson.duration || 'غير محدد'}</span>
                </div>
                {completedLessons.includes(lesson.lesson_id) && (
                  <div className="check-mark">✓</div>
                )}
                 {!lesson.is_accessible && (
                    <div className="lock-mark">🔒</div>
                 )}
              </div>
            ))}
             {lessons.length === 0 && <p style={{padding: '1rem'}}>لا توجد دروس متاحة حالياً.</p>}
          </div>
        </div>
      </div>

       <div className="course-faq-section">
         <h2>الأسئلة الشائعة</h2>
         <div className="faq-grid">
           {(course.faqs || []).map((faq, index) => (
             <div key={index} className="faq-card">
               <h4>❓ {faq.question}</h4>
               <p>{faq.answer}</p>
             </div>
           ))}
            {(course.faqs || []).length === 0 && <p style={{gridColumn: '1 / -1', textAlign: 'center'}}>لا توجد أسئلة شائعة.</p>}
         </div>
       </div>

    </div>
  );
}

export default CourseWatchPage;