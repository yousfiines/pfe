import React from "react";
import { FaFacebook, FaMapMarkerAlt } from "react-icons/fa";

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
          
            <div style={{ display: 'flex', gap: '20px' }}>
              <a
                href="https://www.facebook.com/profile.php?id=61554467716200"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#fff", fontSize: "2rem" }}
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.google.com/maps?q=Campus+Universitaire+cité+agricole+Sidi+Bouzid+TUNISIE"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#fff", fontSize: "2rem" }}
              >
                <FaMapMarkerAlt />
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <a href="/teacher">Enseignant</a>
          </div>
          
          <div className="footer-section">
            <a href="/studentDoc">Étudiant</a>
          </div>
        </div>
        
        <p style={{ margin: '0' }}>
          © {new Date().getFullYear()} Faculté des Sciences et Technologies - Tous droits réservés
        </p>
      </footer>
    </div>
  ); 
}