import React, { useRef } from "react"; // Import useRef
import logoFac from "./../../../assets/logoFac.png";

const Header = () => { // Correct name of the component
  const newsSectionRef = useRef(null);
  const programsSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page">
      <header className="header">
        <a href="/">
          <img src={logoFac} width="100" height="100" alt="Logo de la Faculté" />
        </a>
        <nav className="nav">
          <button onClick={() => scrollToSection(programsSectionRef)}>Formations</button>
          <button onClick={() => scrollToSection(newsSectionRef)}>Événement</button>
          <a href="/contact">Contact</a>
          <a href="/connexion">Se connecter</a>
          <a href="/enseignant">Enseignant</a>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1>Bienvenue à la Faculté des Sciences et Techniques de Sidi Bouzid</h1>
          <p>Formez-vous pour un avenir brillant</p>
        </div>
      </section>

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
      </section>

      <section className="programs-section" ref={programsSectionRef}>
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

      <section className="news-section" ref={newsSectionRef}>
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

export default Header; // Correct export