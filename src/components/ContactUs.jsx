import { useState } from 'react'
import './ContactUs.css'

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('شكراً لتواصلك معنا! سنرد عليك قريباً')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <>
      <div className="section" id="contact"></div>
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-header">
            <h2 className="contact-title">تواصل معنا</h2>
            <p className="contact-subtitle">نسعد بالتواصل معك والإجابة على استفساراتك</p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <div className="info-card adress">
                <div className="info-icon">📍</div>
                <h3>العنوان</h3>
                <p>القاهرة، مصر</p>
              </div>

              <div className="info-card">
                <div className="info-icon">📧</div>
                <h3>البريد الإلكتروني</h3>
                <p>evolve881gmail.com</p>
              </div>

              <div className="info-card">
                <div className="info-icon">📱</div>
                <h3>الهاتف</h3>
                <p dir="ltr">+20 10 13712125</p>
              </div>


              <div className="info-card social">
                <div className="info-icon">🌐</div>
                <h3>وسائل التواصل</h3>
                <div className="social-links">
                  <a target='_blank' href="https://www.facebook.com/share/1AJ286uMMu/" className="social-link">Facebook</a>
                  <a target='_blank' href="https://www.tiktok.com/@evolve.group?_t=ZS-90qbkN2rWWz&_r=1" className="social-link">TikTok</a>
                  <a target='_blank' href="https://www.linkedin.com/company/evolve-group%E2%80%8F/" className="social-link">LinkedIn</a>
                  <a target='_blank' href="https://www.instagram.com/evolve___group?igsh=NjZ1eXIzdzZxNmNj" className="social-link">Instagram</a>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="البريد الإلكتروني"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="الموضوع"
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="رسالتك"
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                إرسال الرسالة
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default ContactUs
