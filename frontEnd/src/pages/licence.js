import React from 'react';
import "../pages/styles.css" // Importez le fichier CSS pour les styles
import image1 from './image1.jpg'; // Importez les images
import image2 from './image2.jpg';

function Accueil() {
  return (
    <div className="accueil-page"> {/* Conteneur principal */}
      <header>
        
      </header>

      <main>
        <section className="content-block">
          <img src={image1} alt="Image 1" />
          <a href="/lsi1">
            <div className="course-item">
              <h2>LSI1</h2>
            </div>
          </a>
        </section>

        <section className="content-block">
          <img src={image2} alt="Image 2" />
          <a href="/lsi2">
            <div>
              <h2>LSI2</h2>
            </div>
          </a>
        </section>

        <section className="content-block">
          <img src={image2} alt="Image 2" />
          <a href="/lsi3">
            <div>
              <h2>LSI3</h2>
            </div>
          </a>
        </section>
      </main>

      <footer>
        <p>&copy; 2024 Mon Site. Tous droits réservés.</p>
        <nav className="footer-nav">
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}

export default Accueil;