import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoFac from "./../../assets/logoFac.png";
import Lottie from "lottie-react";
import home from "./../../assets/lotties/home.json";
import { FaChalkboardTeacher, FaCalendarAlt, FaClock, FaBook, FaGraduationCap, FaUniversity } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const TeacherProfil = () => {
  const navigate = useNavigate();
  const newsSectionRef = useRef(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
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



  const handleEventClick = (eventName) => {
    navigate('/eventForm', { state: { selectedEvent: eventName } });
  };

  // Données de l'enseignant (à remplacer par des données réelles)
  const [teacherData, setTeacherData] = useState({
    name: "Dr. Mohamed Ali",
    title: "Professeur Associé",
    department: "Informatique",
    email: "mohamed.ali@univ-kb.tn",
    phone: "+216 12 345 678",
    office: "Bâtiment A, Bureau 203",
    bio: "Spécialiste en Intelligence Artificielle avec plus de 15 ans d'expérience dans l'enseignement et la recherche."
  });

  // Emploi du temps
  const [schedule, setSchedule] = useState([
    { day: "Lundi", time: "08:00 - 10:00", course: "Algorithmique", room: "A101", type: "Cours" },
    { day: "Lundi", time: "14:00 - 16:00", course: "Base de données", room: "B205", type: "TD" },
    { day: "Mardi", time: "10:00 - 12:00", course: "IA", room: "A301", type: "Cours" },
    { day: "Mercredi", time: "09:00 - 11:00", course: "Réseaux", room: "C102", type: "TP" },
    { day: "Jeudi", time: "08:00 - 10:00", course: "Sécurité", room: "B107", type: "Cours" },
  ]);

  // Examens
  const [exams, setExams] = useState([
    { title: "Examen Algorithmique", date: "2023-12-15", time: "08:00 - 11:00", room: "Amphi A" },
    { title: "Examen Base de données", date: "2023-12-18", time: "09:00 - 12:00", room: "Salle B205" },
    { title: "Examen IA", date: "2023-12-20", time: "10:00 - 13:00", room: "Amphi B" },
  ]);

  const handleLoginClick = () => {
    console.log("Bouton de connexion cliqué");
  };

  const checkAdminStatus = () => {
    return localStorage.getItem('isAdmin') === 'true';
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

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      {/* Navbar */}
      <header style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem 5%",
        backgroundColor: "#fff",
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <a href="/" style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none"
        }}>
          <img
            src={logoFac}
            width="80"
            height="80"
            alt="Logo Faculté"
            style={{
              objectFit: "contain",
              marginRight: "1rem",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}
          />
          <div style={{
            borderLeft: "2px solid #0056b3",
            paddingLeft: "1rem",
            height: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <span style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#0056b3"
            }}>Faculté des Sciences</span>
            <span style={{
              fontSize: "0.9rem",
              color: "#555"
            }}>Université de Kairouan</span>
          </div>
        </a>
        <div style={{ flexGrow: 1 }}></div>
        <a href="/teacherUploadDoc" style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none"
        }}>
          
          <div style={{
            
            paddingLeft: "1rem",
            height: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <span style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#0056b3"
            }}>Diffuser cours</span>
           
          </div>
        </a>

        
      </header>

      {/* Section principale */}
      <div style={{
        display: "flex",
        padding: "2rem 5%",
        gap: "2rem"
      }}>
        {/* Colonne de gauche - Profil */}
        <div style={{
          flex: "0 0 300px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "2rem",
          height: "fit-content"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "2rem"
          }}>
            <div style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              backgroundColor: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
              overflow: "hidden"
            }}>
              <FaChalkboardTeacher size={80} color="#555" />
            </div>
            <h2 style={{ margin: "0.5rem 0", color: "#0056b3" }}>{teacherData.name}</h2>
            <p style={{ margin: "0", color: "#666", fontWeight: "500" }}>{teacherData.title}</p>
            <p style={{ margin: "0.5rem 0", color: "#777" }}>{teacherData.department}</p>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#444" }}>
              <FaUniversity /> Informations
            </h3>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" }}>
                <MdEmail color="#0056b3" /> {teacherData.email}
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" }}>
                <MdPhone color="#0056b3" /> {teacherData.phone}
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" }}>
                <MdLocationOn color="#0056b3" /> {teacherData.office}
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem", marginTop: "1rem" }}>
            <h3 style={{ color: "#444" }}>À propos</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>{teacherData.bio}</p>
          </div>
        </div>

        {/* Colonne de droite - Contenu principal */}
        <div style={{ flex: "1" }}>
          {/* Section de bienvenue */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "2rem"
          }}>
            <div style={{ flex: "1" }}>
              <h1 style={{ color: "#0056b3", marginBottom: "1rem" }}>
                Bienvenue, {teacherData.name}
              </h1>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Enseigner, c'est semer des graines de savoir qui fleuriront toute une vie.
                Consultez votre emploi du temps, vos examens à venir et restez à jour avec les dernières actualités.
              </p>
            </div>
            <div style={{ width: "200px" }}>
              <Lottie animationData={home} loop={true} />
            </div>
          </div>

          {/* Emploi du temps */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#0056b3", marginBottom: "1.5rem" }}>
              <FaClock /> Emploi du temps
            </h2>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Jour</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Heure</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Cours</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Salle</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "0.75rem" }}>{item.day}</td>
                      <td style={{ padding: "0.75rem" }}>{item.time}</td>
                      <td style={{ padding: "0.75rem" }}>{item.course}</td>
                      <td style={{ padding: "0.75rem" }}>{item.room}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: item.type === "Cours" ? "#e3f2fd" : 
                                          item.type === "TD" ? "#e8f5e9" : "#fff8e1",
                          color: item.type === "Cours" ? "#1976d2" : 
                                item.type === "TD" ? "#2e7d32" : "#ff8f00"
                        }}>
                          {item.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calendrier des examens */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#0056b3", marginBottom: "1.5rem" }}>
              <FaCalendarAlt /> Calendrier des examens
            </h2>
            
            <div style={{ marginBottom: "2rem" }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek"
                }}
                events={exams.map(exam => ({
                  title: exam.title,
                  start: exam.date,
                  end: exam.date,
                  extendedProps: {
                    time: exam.time,
                    room: exam.room
                  }
                }))}
                eventContent={(eventInfo) => (
                  <div>
                    <b>{eventInfo.event.title}</b>
                    <div style={{ fontSize: "0.8em" }}>
                      {eventInfo.event.extendedProps.time}
                    </div>
                  </div>
                )}
                eventDidMount={(info) => {
                  info.el.style.backgroundColor = "#e3f2fd";
                  info.el.style.borderColor = "#bbdefb";
                  info.el.style.color = "#0d47a1";
                }}
                height="auto"
              />
            </div>

            <div>
              <h3 style={{ color: "#444", marginBottom: "1rem" }}>Examens à venir</h3>
              {exams.map((exam, index) => (
                <div key={index} style={{
                  padding: "1rem",
                  marginBottom: "0.5rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", color: "#0056b3" }}>{exam.title}</h4>
                    <p style={{ margin: "0", color: "#666" }}>
                      {new Date(exam.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      {" • " + exam.time}
                    </p>
                  </div>
                  <div style={{ color: "#777" }}>
                    <FaBook /> {exam.room}
                  </div>
                </div>
              ))}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfil;