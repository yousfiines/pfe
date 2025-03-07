import React from "react";
import "./styles.css";
import logo from "../assets/logo.png";


function Home() {
  return (
    
        <header>
 
    
    
          <nav>
            <ul>
            <img src={logo} alt="Logo" />
              <li><a href="/">Accueil</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/a-propos">À propos</a></li>
              <li><a href="/contact">Contact</a></li>
              <li>< a href="/connexion">Se connecter</a></li>
              
              
            </ul>
           
          </nav>
    
    
    </header>
    
    );
    }

export default Home;