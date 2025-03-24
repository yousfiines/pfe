import React, { useRef } from "react";
import logoFac from "./../../../assets/logoFac.png";
import Lottie from "lottie-react";
import home from "../../../assets/lotties/home.json"
import "../../../../src/styles.css"
const Header = () => {
  const newsSectionRef = useRef(null);
  const programsSectionRef = useRef(null);
  //const footerRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });


  

<Lottie animationData={home} loop={true} />;


  };

  return (
    <div className="home-page">
      <header className="header">
        <a href="/">
          <img src={logoFac} width="80" height="80" alt="Logo de la Faculté" />
        </a>
        <nav className="nav">
          <a href="#formations" onClick={() => scrollToSection(programsSectionRef)}>Formations</a>
          <a href="#evenements" onClick={() => scrollToSection(newsSectionRef)}>Événements</a>
          <a href="/contact">Contact</a>
          <a href="/connexion">Se connecter</a>
          <a href="/enseignant">Enseignant</a>
        </nav>
      </header>



      <table>
      <tbody>
        <tr>
          <td> <section className="hero-section">
        <div className="hero-content">
          <h1>Bienvenue à la Faculté des Sciences
            et Techniques de Sidi Bouzid</h1>
          <h4>Formez-vous pour un avenir brillant</h4>
        </div>
      </section></td>
          <td> <div className="image-container">

<div >
    <Lottie
        animationData={home}
      
        loop={true}
    />
</div>
      </div></td>
        </tr>
      </tbody>
    </table>




     
       
      <section className="about-section">
        <h2>À propos de nous</h2>
        <p>
          La Faculté des Sciences et Techniques de Sidi Bouzid (FST-SBZ) a été créée le 4 septembre 2012, conformément au décret n° 1645 de l'année 2012. En tant qu'établissement rattaché à l'Université de Kairouan, elle joue un rôle essentiel dans l'équilibre de la carte universitaire du pays et contribue au développement des régions intérieures.
        </p>
        <p>
          La mission principale de la FST-SBZ est de former des étudiants dans les domaines des sciences et des technologies, en leur offrant une éducation de qualité. Elle s'engage à promouvoir la recherche scientifique, à encourager l'innovation et à faciliter l'insertion professionnelle de ses diplômés, tout en participant activement au développement régional et national.
        </p>
        <div className="stats">
          <div className="stat">
            <h3>5000+</h3>
            <p>Étudiants</p>
          </div>
          <div className="stat">
            <h3>50+</h3>
            <p>Programmes</p>
          </div>
          <div className="stat">
            <h3>100+</h3>
            <p>Partenariats</p>
          </div>
        </div>
      </section>*

      <section className="programs-section" ref={programsSectionRef} id="formations">
        <h2>Nos formations</h2>
        <div className="programs-grid">
          <div className="program-card">
            <h3>Licence</h3>
            <p>Découvrez notre programme de licence</p>
          </div>
          <div className="program-card">
            <h3>Master</h3>
            <p>Explorez notre programme de master</p>
          </div>
          <div className="program-card">
            <h3>Doctorat</h3>
            <p>Participez à des recherches de pointe</p>
          </div>
          
        </div>
      </section>

      <section className="news-section" ref={newsSectionRef} id="evenements">
        <h2>Actualités et événements</h2>
        <div className="news-grid">
          <div className="news-card">
            <h3>Conférence sur l'IA</h3>
            <p>Rejoignez notre conférence sur l'intelligence artificielle.</p>
          </div>
          <div className="news-card">
            <h3>Atelier de programmation</h3>
            <p>Participez à notre atelier de programmation avancée.</p>
          </div>
        </div>
       </section>
    </div>
  );
};

export default Header;