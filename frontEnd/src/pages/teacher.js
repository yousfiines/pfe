import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import logoFac from "./../assets/logoFac.png";
import licencee from "./../assets/img/licencee.png";
import master from "../e.png../../assets/img/master.png";
import Lottie from "lottie-react";
import home from "./../assets/lotties/home.json"
import doctorat from "./../assets/img/doctorat.png";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FaGraduationCap, FaFlask, FaHandshake } from "react-icons/fa";

const Teacher = () => { // Removed the extra curly braces here
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const newsSectionRef = useRef(null);
  const programsSectionRef = useRef(null);
  const contactSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };


  const checkAdminStatus = () => {
    // Implémentez votre logique de vérification ici
    // Par exemple, vérifier dans localStorage ou via une API
    return localStorage.getItem('isAdmin') === 'true';
  };

  const handleSeeMore = (programType) => {
    navigate('/licence');
  };

  const handleEventClick = (eventName) => {
    navigate('/eventForm', { state: { selectedEvent: eventName } });
  };


  useEffect(() => {
    setIsAdmin(checkAdminStatus());
  }, []);

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };


  const programs = [
    {
      title: "Licence",
      description: "Découvrir la liste des filières universitaire",
      image: licencee,
      path: "licence",
    },
    {
      title: "Master",
      description: "Explorez notre programme de master",
      image: master,
      path: "master",
    },
    {
      title: "Doctorat",
      description: "Participez à des recherches de pointe",
      image: doctorat,
      path: "doctorat",
    },
  ];

  const events = [
    {
      title: "Conférence sur l'IA",
      description: "Rejoignez notre conférence sur l'intelligence artificielle.",
    },
    {
      title: "Atelier de programmation",
      description: "Participez à notre atelier de programmation avancée.",
    },
  ];
  return (
    <div className="home-page">
      <header className="header">
        <a href="/">
          <img src={logoFac} width="80" height="80" alt="Logo de la Faculté" />
        </a>
        <nav className="nav">
          <a href="#formations" onClick={() => scrollToSection(programsSectionRef)}>Formations</a><a href="#evenements" onClick={() => scrollToSection(newsSectionRef)}>Événements</a>
         

          <a href="/teacherUploadDoc">Seeeee</a>
          <a href="/studentDoc">etudiant</a>
          <a href="/teacherUploadDoc">Diffuser_cours</a>
          {/*<button
            className="admin-button"
            onClick={handleAdminClick}
          >
            {isAdmin ? 'Espace Admin' : 'Admin'}
          </button>*/ }
        </nav>
      </header>
      {/* ... The rest of your Header component's JSX ... */}
      
                   
                
                   
             
                   <section className="news-section" ref={newsSectionRef} id="evenements">
                     <h2>Actualités et événements</h2>
                     <div className="news-grid">
                       {events.map((event, index) => (
                         <div 
                           key={index} 
                           className="news-card"
                           onClick={() => handleEventClick(event.title)}
                           style={{ cursor: 'pointer' }}
                         >
                           <h3>{event.title}</h3>
                           <p>{event.description}</p>
                           
                         </div>
                       ))}
                     </div>
                   </section>
             
                   <section className="contact-section" ref={contactSectionRef} id="contact"> {/* Section contact ajoutée */}
                     
                     {/* Ajoutez ici le contenu de votre section contact */}
                   </section>
                 </div>
               );
             };
             
export default Teacher;