import React from "react";
import { FaFacebook } from "react-icons/fa"; 

export default function Footer() {
  return (
    <div>
      {/* Pied de page */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contactez-nous</h3>
            <p>Email: fstsbz.contact@fstsbz.u-kairouan.tn</p>
            <p>Téléphone: 76 636 260</p>
          </div>
          <div className="footer-section">
            <h3>Réseaux sociaux</h3>
            <a
              href="https://www.facebook.com/profile.php?id=61554467716200"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff", fontSize: "2rem" }}
            >
              <FaFacebook />
            </a>
          </div>

        </div>
        <p style={{ margin: '0' }}>© {new Date().getFullYear()} Faculté des Sciences et Technologies - Tous droits réservés</p>

      </footer>
    </div>
  ); 
}
