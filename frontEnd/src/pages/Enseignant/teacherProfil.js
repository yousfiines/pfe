import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoFac from "./../../assets/logoFac.png";
import Lottie from "lottie-react";
import home from "../../assets/lotties/home.json";
import { FaChalkboardTeacher, FaCalendarAlt, FaClock, FaBook, FaGraduationCap, FaTicketAlt, FaStar , FaArrowRight , FaUniversity } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from 'axios';
import { Chip } from '@mui/material';
import { motion } from 'framer-motion';

const TeacherProfil = () => {
  const navigate = useNavigate();
  const newsSectionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
 // Données de l'enseignant
 const [teacherData, setTeacherData] = useState(null);

 const [previewImage, setPreviewImage] = useState(null);

const fileInputRef = useRef(null);

const [events, setEvents] = useState([]);
useEffect(() => {
  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/evenements");
      setEvents(response.data.data);
    } catch (error) {
      console.error("Erreur chargement événements:", error);
    }
  };
  fetchEvents();
}, []);


  const handleEventClick = (eventName) => {
    navigate('/eventForm', { state: { selectedEvent: eventName } });
  };

 

  // Emploi du temps et examens (peuvent être récupérés depuis l'API si nécessaire)
  const [schedule] = useState([
    { day: "Lundi", time: "08:00 - 10:00", course: "Algorithmique", room: "A101", type: "Cours" },
    { day: "Lundi", time: "14:00 - 16:00", course: "Base de données", room: "B205", type: "TD" },
    { day: "Mardi", time: "10:00 - 12:00", course: "IA", room: "A301", type: "Cours" },
    { day: "Mercredi", time: "09:00 - 11:00", course: "Réseaux", room: "C102", type: "TP" },
    { day: "Jeudi", time: "08:00 - 10:00", course: "Sécurité", room: "B107", type: "Cours" },
  ]);

  const [exams] = useState([
    { title: "Examen Algorithmique", date: "2023-12-15", time: "08:00 - 11:00", room: "Amphi A" },
    { title: "Examen Base de données", date: "2023-12-18", time: "09:00 - 12:00", room: "Salle B205" },
    { title: "Examen IA", date: "2023-12-20", time: "10:00 - 13:00", room: "Amphi B" },
  ]);

  // Simplifiez fetchTeacherData
useEffect(() => {
  const fetchTeacherData = async () => {
    setIsLoading(true);
    try {
      const teacherCin = localStorage.getItem('teacherCin');
      const token = localStorage.getItem('token');

      if (!token || !teacherCin) {
        navigate('/connexion');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/enseignants?cin=${teacherCin}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      
      if (data.success) {
        setTeacherData(data.data);
        // Utilisez toujours ProfileImage (même nom que dans la BDD)
        if (data.data.ProfileImage) {
          setPreviewImage(data.data.ProfileImage);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('teacherCin');
      navigate('/connexion');
    } finally {
      setIsLoading(false);
    }
  };

  fetchTeacherData();
}, [navigate]);

// handleImageChange optimisé
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Prévisualisation instantanée
  const reader = new FileReader();
  reader.onload = (e) => setPreviewImage(e.target.result);
  reader.readAsDataURL(file);

  try {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch('http://localhost:5000/api/upload-profile-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) throw new Error(result.message || "Échec de l'envoi");
    
    // Mise à jour avec l'URL permanente
    setPreviewImage(result.imageUrl);
  } catch (error) {
    console.error("Erreur upload:", error);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Chargement de votre profil...</div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div>Erreur de chargement des données. Veuillez vous reconnecter.</div>
      </div>
    );
  }

  // Préparation des données pour l'affichage
  const teacherProfile = {
    name: teacherData?.Nom_et_prénom || "Nom non spécifié",
    title: teacherData?.Classement || "Enseignant",
    email: teacherData?.Email || "Email non spécifié",
    phone: teacherData?.Numero_tel ? `+216 ${teacherData.Numero_tel}` : "Non spécifié",
    bio: teacherData?.Description || "Aucune description fournie.",
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('teacherCin');
    localStorage.removeItem('teacherEmail');
    navigate('/connexion');
  };
  
  // Ajouter ce bouton dans la navbar
  <button onClick={handleLogout} style={{ /* styles */ }}>
    Déconnexion
  </button>



  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du téléchargement');
      }
      
      console.log('Image téléchargée avec succès:', data);
      // Mettre à jour les données de l'enseignant si nécessaire
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement de l\'image');
    }
  };
  const styles = {
    profileImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  };
  function getArtGradient(type) {
    const gradients = {
      'Conférence': '#8b5cf6, #7c3aed',
      'Atelier': '#ec4899, #db2777',
      'Exposition': '#f59e0b, #d97706',
      'Performance': '#10b981, #059669'
    };
    return gradients[type] || '#6d28d9, #4c1d95';
  }
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
            }}>Faculté des Sciences et Techniques FSTSBZ</span>
            <span style={{
              fontSize: "0.9rem",
              color: "#555"
            }}>Université de Kairouan</span>
          </div>
        </a>

        <div style={{ flexGrow: 1 }}></div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/teacherUploadDoc" style={{
            textDecoration: "none",
            color: "#0056b3",
            fontWeight: "bold"
          }}>
            Diffuser cours
          </a>
         
        </div>
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
    {/* Section Photo UNIQUE (version améliorée) */}
    <div style={{
  position: 'relative',
  width: "150px",
  height: "150px",
  borderRadius: "50%",
  backgroundColor: "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
  overflow: "hidden",
  cursor: 'pointer'
}} onClick={() => fileInputRef.current.click()}>
  {previewImage ? (
    <img 
      src={previewImage} 
      alt="Photo de profil" 
      style={{ 
        width: '100%', 
        height: '100%',
        objectFit: 'cover'
      }}
    />
  ) : (
    <FaChalkboardTeacher size={60} color="#555" />
  )}
  <div style={{
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: '0.5rem',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    textAlign: 'center',
    fontSize: '0.8rem'
  }}>
    Changer photo
  </div>
</div>

    <h2 style={{ margin: "0.5rem 0", color: "#0056b3" }}>{teacherProfile.name}</h2>
    <p style={{ margin: "0", color: "#666", fontWeight: "500" }}>{teacherProfile.title}</p>
  </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#444" }}>
              <FaUniversity /> Informations
            </h3>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" }}>
                <MdEmail color="#0056b3" /> {teacherProfile.email}
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" }}>
                <MdPhone color="#0056b3" /> {teacherProfile.phone}
              </p>
              
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem", marginTop: "1rem" }}>
            <h3 style={{ color: "#444" }}>À propos</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>{teacherProfile.bio}</p>
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
                Bienvenue, {teacherProfile.name}
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
      
            </div>
           
          </div>
          <section style={{
  padding: '8rem 2rem',
  background: '#fafafa',
  position: 'relative'
}}>
  {/* Élément décoratif abstrait */}
  <div style={{
    position: 'absolute',
    top: '10%',
    right: '5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(255,255,255,0) 70%)',
    zIndex: 0
  }}></div>

  <div style={{
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  }}>
    <div style={{
      textAlign: 'center',
      marginBottom: '6rem'
    }}>
      <h2 style={{
        fontSize: '3.5rem',
        fontWeight: '300',
        color: '#1e293b',
        marginBottom: '1.5rem',
        letterSpacing: '1px'
      }}>
        <span style={{
          fontWeight: '500',
          background: 'linear-gradient(90deg, #7e22ce 0%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Notre Programme</span> Culturel
      </h2>
      <p style={{
        color: '#64748b',
        fontSize: '1.2rem',
        maxWidth: '700px',
        margin: '0 auto',
        lineHeight: '1.8'
      }}>
        Des expériences immersives où l'art rencontre l'innovation
      </p>
    </div>

    {/* Conteneur avec deux événements par ligne */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '3rem',
      marginBottom: '4rem'
    }}>
      {events.map((event, index) => (
        <motion.div 
          key={event.id}
          whileHover={{ y: -10 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.03)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{
            height: '280px',
            background: `linear-gradient(45deg, ${getArtGradient(event.type)})`,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              left: '2rem',
              color: 'white',
              zIndex: 2
            }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {event.type.toUpperCase()}
              </div>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '600',
                margin: 0,
                lineHeight: '1.2',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {event.titre}
              </h3>
            </div>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)'
            }}></div>
          </div>

          <div style={{ padding: '2.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: '#f5f3ff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#7e22ce'
                  }}>
                    {new Date(event.date).getDate()}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#7e22ce',
                    textTransform: 'uppercase'
                  }}>
                    {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>
                    {new Date(event.date).toLocaleString('fr-FR', { weekday: 'long' })}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#1e293b'
                  }}>
                    {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{
                alignSelf: 'flex-end'
              }}>
                <div style={{
                  backgroundColor: '#f5f3ff',
                  color: '#7e22ce',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <MdLocationOn size={16} />
                  {event.lieu}
                </div>
              </div>
            </div>

            <p style={{
              color: '#64748b',
              lineHeight: '1.7',
              marginBottom: '2.5rem'
            }}>
              {event.description.substring(0, 120)}...
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#7e22ce',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                ':hover': {
                  backgroundColor: '#6b21a8'
                }
              }}>
                <FaTicketAlt /> Réserver
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    
    
  </div>
</section>
        </div>
        
      </div>
    </div>
  );
};

export default TeacherProfil;