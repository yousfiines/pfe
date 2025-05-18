import React from "react";
import { FaFacebook, FaMapMarkerAlt } from "react-icons/fa";
import "./Footer.css"; // on importe le CSS

export default function Footer() {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Contactez-nous</h3>
          <p>Email : fstsbz.contact@fstsbz.u-kairouan.tn</p>
          <p>Téléphone : 76 636 260</p>
        </div>

        <div className="footer-section">
          <h3>Suivez-nous</h3>
          <div className="footer-icons">
            <a
              href="https://www.facebook.com/profile.php?id=61554467716200"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.google.com/maps?q=Campus+Universitaire+cité+agricole+Sidi+Bouzid+TUNISIE"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon"
            >
              <FaMapMarkerAlt />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Accès rapide</h3>
          <a href="/teacher">Espace Enseignant</a>
          <br />
          <a href="/eudiant">Espace Étudiant</a>
        </div>

        <div className="footer-section">
          <h3>Adresse</h3>
          <p>Campus Universitaire</p>
          <p>Cité Agricole, Sidi Bouzid</p>
          <p>TUNISIE</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Faculté des Sciences et Technologies — Tous droits réservés.
      </div>
    </footer>
  );
}
