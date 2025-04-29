import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaFlask } from 'react-icons/fa';
import IMG from "../../../assets/img/IMG.JPG";
import logoFac from "./../../../assets/logoFac.png";
import faculte from "./../../../assets/img/faculte.JPG"; 
import facultee from "./../../../assets/img/facultee.JPG"; 
import faculté from "./../../../assets/img/faculté.JPG"
const Header = () => {
  const [activeImage, setActiveImage] = useState(0);
  const images = [faculte, facultee, faculté]; // J'ai ajouté faculté ici
  const handleLoginClick = () => {
    console.log("Bouton de connexion cliqué");
  };

  // Animation pour alterner entre les images avec effet de glissement
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage(prev => (prev + 1) % images.length);
    }, 5000); // Change d'image toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

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
        <a href='/connexion'>
          <button
            onClick={handleLoginClick}
            style={{
              background: "linear-gradient(to right, #0056b3, #0077cc)",
              color: "white",
              border: "none",
              padding: "0.7rem 1.8rem",
              borderRadius: "30px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 3px 6px rgba(0, 86, 179, 0.2)",
              letterSpacing: "0.5px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #004494, #0066b3)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 86, 179, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #0056b3, #0077cc)";
              e.currentTarget.style.boxShadow = "0 3px 6px rgba(0, 86, 179, 0.2)";
            }}
          >
            Se connecter
          </button>
        </a>
      </header>

      {/* Bande défilante sous la navbar */}
      <div style={{
        backgroundColor: "#0056b3",
        overflow: "hidden",
        whiteSpace: "nowrap",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "1rem",
        padding: "0.5rem 0",
        borderBottom: "3px solid #003e80",
        position: "relative"
      }}>
        <div style={{
          display: "inline-block",
          paddingLeft: "100%",
          animation: "scrollText 15s linear infinite"
        }}>
          Bienvenue à la Faculté des Sciences et Techniques de Sidi Bouzid FSTSBZ — Excellence, Innovation, Avenir.
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes scrollText {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {/* Hero Section avec image de fond */}
      <section style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${IMG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        marginTop: '-3px'
      }}>
        <div style={{
          maxWidth: '800px',
          padding: '20px',
          zIndex: 2
        }}>
          <p style={{
            fontSize: '2.5rem',
            marginBottom: '20px',
            fontWeight: '700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>Un établissement d'excellence académique dédié à la formation des leaders scientifiques de demain.</p>
          <p style={{
            fontSize: '1.5rem',
            opacity: '0.9',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>Excellence académique, innovation et recherche de pointe</p>
        </div>
      </section>

      {/* Section Notre Institution avec animation de défilement */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#fff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: '#1e3c72',
              fontWeight: '600',
              marginBottom: '10px'
            }}>Notre faculté</h2>
            <div style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#1e3c72',
              margin: '0 auto 15px'
            }}></div>
            <p style={{
              fontSize: '1.2rem',
              color: '#666',
              fontStyle: 'italic'
            }}>Excellence académique depuis 2012</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '50px',
            marginBottom: '60px',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative',
              height: '400px',
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              {/* Conteneur des images avec animation */}
              <div style={{
                display: 'flex',
                width: `${images.length * 100}%`,
                height: '100%',
                transform: `translateX(-${activeImage * (100 / images.length)}%)`,
                transition: 'transform 0.8s ease-in-out'
              }}>
                {images.map((img, index) => (
                  <div key={index} style={{
                    width:` ${100 / images.length}%`,
                    height: '100%',
                    position: 'relative'
                  }}>
                    <img 
                      src={img}
                      alt={`Campus universitaire ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(30,60,114,0.1), rgba(30,60,114,0.3))'
                    }}></div>
                  </div>
                ))}
              </div>
              
              {/* Indicateurs de slide */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px'
              }}>
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      backgroundColor: index === activeImage ? '#1e3c72' : 'rgba(255,255,255,0.5)',
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            textAlign: 'center',
            marginTop: '60px'
          }}>
            {[
              { value: "1500+", label: "Étudiants", icon: "👨‍🎓" },
              { value: "40+", label: "Programmes", icon: "📚" },
              { value: "10+", label: "Partenariats", icon: "🤝" },
              { value: "5+", label: "Laboratoires", icon: "🔬" }
            ].map((stat, index) => (
              <div key={index} style={{
                padding: '30px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontSize: '2rem',
                  display: 'block',
                  marginBottom: '15px'
                }}>{stat.icon}</span>
                <h3 style={{
                  fontSize: '2.2rem',
                  color: '#1e3c72',
                  margin: '0 0 5px',
                  fontWeight: '700'
                }}>{stat.value}</h3>
                <p style={{
                  color: '#666',
                  fontSize: '1rem',
                  margin: 0
                }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#fff'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '20px',
          color: '#1e3c72',
          fontWeight: '600',
          position: 'relative',
          paddingBottom: '15px'
        }}>Nos Valeurs Fondamentaux</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '40px',
          maxWidth: '1200px',
          margin: '40px auto 0'
        }}>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            textAlign: 'center',
            ':hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>🏛</div>
            <h3 style={{
              color: '#1e3c72',
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: '600'
            }}>Tradition</h3>
            <p style={{
              color: '#555',
              fontSize: '1rem'
            }}>
              Un héritage académique riche combiné à des méthodes d'enseignement éprouvées pour une formation solide.
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            textAlign: 'center',
            ':hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>🌍</div>
            <h3 style={{
              color: '#1e3c72',
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: '600'
            }}>Ouverture</h3>
            <p style={{
              color: '#555',
              fontSize: '1rem'
            }}>
              Une vision internationale avec des échanges universitaires et des programmes multiculturels.
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            textAlign: 'center',
            ':hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>⚡</div>
            <h3 style={{
              color: '#1e3c72',
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: '600'
            }}>Innovation</h3>
            <p style={{
              color: '#555',
              fontSize: '1rem'
            }}>
              Des laboratoires high-tech et des méthodes pédagogiques innovantes pour préparer l'avenir.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '20px',
            color: '#fff',
            fontWeight: '600',
            position: 'relative',
            paddingBottom: '15px'
          }}>
            Nos Formations
          </h2>
          <div style={{
            width: '80px',
            height: '4px',
            backgroundColor: '#f1c40f',
            margin: '15px auto 0',
            borderRadius: '2px'
          }}></div>
          <p style={{
            textAlign: 'center',
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.85)',
            maxWidth: '800px',
            margin: '0 auto 50px',
            lineHeight: '1.6'
          }}>
            Des programmes académiques conçus pour former les experts de demain et répondre aux défis scientifiques contemporains
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginTop: '40px'
          }}>
            {/* Licence */}
            <div style={{
              background: '#fff',
              padding: '35px 30px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              borderTop: '5px solid #3498db',
              ':hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#e8f4fc',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <span style={{
                    fontSize: '1.8rem',
                    color: '#3498db'
                  }}>🎓</span>
                </div>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.6rem',
                  fontWeight: '600',
                  margin: 0
                }}>Licence</h3>
              </div>
              
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {['Science de l\'Informatique "Computer Science"', 'Technologies de l\'Information et de la Communication', 'Physique Chimie', 'Technologies Agroalimentaires et Environnement'].map((item, index) => (
                  <li key={index} style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '1.05rem',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3498db',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Master */}
            <div style={{
              background: '#fff',
              padding: '35px 30px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              borderTop: '5px solid #e74c3c',
              ':hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#fdedec',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <span style={{
                    fontSize: '1.8rem',
                    color: '#e74c3c'
                  }}>🔬</span>
                </div>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.6rem',
                  fontWeight: '600',
                  margin: 0
                }}>Master</h3>
              </div>
              
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {['Intelligence Artificielle', 'Data Science', 'Énergies Renouvelables', 'Biotechnologie', 'Chimie Avancée', 'Modélisation Mathématique'].map((item, index) => (
                  <li key={index} style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '1.05rem',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#e74c3c',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Doctorat */}
            <div style={{
              background: '#fff',
              padding: '35px 30px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              borderTop: '5px solid #2ecc71',
              ':hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#e8f8f0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <span style={{
                    fontSize: '1.8rem',
                    color: '#2ecc71'
                  }}>📚</span>
                </div>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.6rem',
                  fontWeight: '600',
                  margin: 0
                }}>Doctorat</h3>
              </div>
              
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {['Informatique et Systèmes', 'Physique Théorique', 'Chimie des Matériaux', 'Biologie Moléculaire', 'Sciences de la Terre', 'Mathématiques Pures'].map((item, index) => (
                  <li key={index} style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '1.05rem',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#2ecc71',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;