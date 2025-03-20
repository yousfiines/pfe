import React from "react";
import "./styles.css"; // Importez le fichier CSS
import logo from "./assets/logo.png"
const App= () => {
  return (
    <div className="home-page">
      {/* En-tête */}
      <header className="header">
       <img src={logo}/>
        <nav className="nav">
          <a href="/">Accueil</a>
          <a href="/formations">Formations</a>
          <a href="/evenement">Evénement</a>
          <a href="/contact">Contact</a>
          <a href="/connect">Se connecter</a>
          
        </nav>
      </header>

      {/* Bannière principale */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bienvenue à la Faculté des Sciences et Techniques de Sidi Bouzid</h1>
          <p>Formez-vous pour un avenir brillant</p>
         
        </div>
      </section>

      {/* À propos de la faculté */}
      <section className="about-section">
        <h2>À propos de nous</h2>
        <p>
        La Faculté des Sciences et Techniques de Sidi Bouzid (FST-SBZ) a été créée le 4 septembre 2012,
conformément au décret n° 1645 de l'année 2012. En tant qu'établissement rattaché à l'Université de
Kairouan, elle joue un rôle essentiel dans l'équilibre de la carte universitaire du pays et contribue au
développement des régions intérieures.
        </p>
        <p>La mission principale de la FST-SBZ est de former des étudiants dans les domaines des sciences
et des technologies, en leur offrant une éducation de qualité. Elle s'engage à promouvoir la recherche
scientifique, à encourager l'innovation et à faciliter l'insertion professionnelle de ses diplômés, tout en
participant activement au développement régional et national.</p>
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

      {/* Formations proposées */}
      <section className="programs-section">
        <h2>Nos formations</h2>
        <div className="programs-grid">
          <div className="program-card">
            <h3>Licence </h3>
            <p>Découvrez notre programme de licence</p>
            
          </div>
          <div className="program-card">
            <h3>Master </h3>
            <p>Explorez notre programme de master</p>
           
          </div>
          <div className="program-card">
            <h3>Doctorat </h3>
            <p>Participez à des recherches de pointe</p>
           
          </div>
        </div>
      </section>

      {/* Actualités et événements */}
      <section className="news-section">
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

      {/* Témoignages
      <section className="testimonials-section">
        <h2>Témoignages</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"La faculté m'a offert une formation de qualité et des opportunités incroyables."</p>
            <h4>- Jean Dupont, Diplômé en Informatique</h4>
          </div>
          <div className="testimonial-card">
            <p>"Un environnement stimulant pour apprendre et grandir."</p>
            <h4>- Marie Curie, Étudiante en Biotechnologie</h4>
          </div>
        </div>
      </section> */}

      {/* Pied de page */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contactez-nous</h3>
            <p>Email: contact@faculte.com</p>
            <p>Téléphone: +123 456 789</p>
          </div>
          <div className="footer-section">
            <h3>Liens utiles</h3>
            <a href="/plan-du-site">Plan du site</a>
            <a href="/politique-de-confidentialite">Politique de confidentialité</a>
          </div>
          <div className="footer-section">
            <h3>Réseaux sociaux</h3>
            <a href="https://facebook.com">Facebook</a>
            <a href="https://twitter.com">Twitter</a>
            <a href="https://linkedin.com">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;