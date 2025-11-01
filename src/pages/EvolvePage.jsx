import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Counter from '../components/Counter'
import About from '../components/About'
import Events from '../components/Events'
import ContactUs from '../components/ContactUs'
import { heroImages ,eventsData , aboutData , heroData } from '../data/EvolvoData'

function EvolvePage() {

  return (
    <div className="evolve-page">
      <Navbar showThemeToggle={false}/>
      <Hero
        title={heroData.title}
        description={heroData.description}
        images={heroImages}
      />
      <Counter />
      <About
        image={aboutData.image}
        title={aboutData.title}
        description={aboutData.description}
        mission={aboutData.mission}
        vision={aboutData.vision}
        Massage={aboutData.Massage}
        showVideo={true}
      />
      <Events events={eventsData} />
      <ContactUs />
    </div>
  )
}

export default EvolvePage
