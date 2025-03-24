import React from "react"; 

export default function Footer() { // Le nom du composant commence par une majuscule
  return (
    <div>
      {/* Pied de page */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contactez-nous</h3>
            <p>Email: contact@faculte.com</p>
            <p>Téléphone: +123 456 789</p>
          </div>
          <div className="footer-section">
            <h3>Réseaux sociaux</h3>
            <a href="https://www.facebook.com/profile.php?id=61554467716200">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  ); // Ajout de l'accolade fermante manquante
}