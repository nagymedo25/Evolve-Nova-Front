import './About.css'

function About({ image, title, description, mission, vision, Massage , showVideo = true }) {
  return (
    <>
      <div className="section" id="about"></div>
      <section className="about-youth">
        <div className="about-container">
          <div className="about-image">
            <img src={image} alt="عن المؤسسة" />
          </div>

          <div className="about-content">
            <h2 className="section-title"><span className="highlight">{title}</span></h2>
            <p className="about-description">{description}</p>

            <div className="about-card">
              <div className="card-title"><i className="fas fa-bullseye"></i> مهمتنا</div>
              <p dangerouslySetInnerHTML={{ __html: mission }} />
            </div>

            <div className="about-card">
              <div className="card-title"><i className="fas fa-eye"></i> رؤيتنا</div>
              <p>{vision}</p>
            </div>

            <div className="about-card">
              <div className="card-title"><i className="fas fa-eye"></i> رسالتنا</div>
              <p>{Massage}</p>
            </div>

            <div className="about-card">
              <div className="card-title text-center">
                نعمل على تنمية المهارات المهنية والعلمية للشباب ودعمهم لتحقيق طموحاتهم.
              </div>
            </div>
          </div>
        </div>

        {showVideo && (
          <>
            <br />
            <div id="video" className="about-video-section">
              <video controls width="100%">
                <source src="/video/vid.mp4" type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            </div>
          </>
        )}
      </section>
      <br />
    </>
  )
}

export default About
