import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  FaCalendarAlt, FaClock, FaTicketAlt, FaMapMarkerAlt, 
  FaUser, FaClipboardList, FaSignOutAlt, FaBookOpen
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';  
import { MdGetApp } from "react-icons/md";
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
`;
const Sidebar = styled.div`
  width: 280px;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
  }
`;

const NavItem = styled.div`
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
  margin: 0.5rem 0;
  font-size: 0.95rem;
  
  ${({ active }) => active && `
    background: rgba(255, 255, 255, 0.1);
    border-left: 4px solid #fff;
    font-weight: 500;
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-out;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #f1f1f1;
`;

const ProfileContainer = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProfilePhoto = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #ecf0f1;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileDetails = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const DetailItem = styled.div`
  background: #f8f9fa;
  padding: 1.2rem;
  border-radius: 8px;
  transition: transform 0.3s;
  flex: 1;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
  word-break: break-all;
`;
const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
  
  th {
    background: #2c3e50;
    color: white;
    padding: 1rem;
    text-align: left;
    font-weight: 500;
  }
  
  td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    color: #555;
  }
  
  tr:hover td {
    background: #f8f9fa;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ExamCard = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ExamDate = styled.div`
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  color: white;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
`;

const ExamDay = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
`;

const ExamMonth = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ExamInfo = styled.div`
  padding: 1.2rem;
  flex: 1;
`;

const ExamTitle = styled.h3`
  margin: 0 0 0.8rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
`;

const ExamDetail = styled.p`
  margin: 0.5rem 0;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f8f9fa;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const EventsSection = styled.section`
  padding: 3rem 2rem;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
  border-radius: 16px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: linear-gradient(90deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%);
  }
`;
const EventsFilter = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;
const EventsHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
`;
const EventsTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #7e22ce, #a855f7);
    border-radius: 2px;
  }
`;
const EventsSubtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.8;
`;

const EventType = styled.div`
  position: absolute;
  bottom: '2rem';
  left: '2rem';
  color: 'white';
  zIndex: 2;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const EventName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;


const EventDateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const EventDay = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #7e22ce;
`;

const EventMonth = styled.div`
  font-size: 0.7rem;
  color: #7e22ce;
  text-transform: uppercase;
`;

const EventTime = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
`;

const EventLocation = styled.div`
  background-color: #f5f3ff;
  color: #7e22ce;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;




const FilterButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: ${({ $active }) => $active ? '#7e22ce' : '#f3f4f6'};
  color: ${({ $active }) => $active ? 'white' : '#4b5563'};
  border: none;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#6b21a8' : '#e5e7eb'};
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2.5rem;
  padding: 1rem;
`;

const EventCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
  border: 1px solid rgba(209, 213, 219, 0.5);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(126, 34, 206, 0.1), 0 10px 10px -5px rgba(126, 34, 206, 0.04);
    border-color: rgba(167, 139, 250, 0.5);
  }
`;

const EventImageContainer = styled.div`
  height: 220px;
  position: relative;
  overflow: hidden;
`;

const EventImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => `linear-gradient(45deg, ${props.gradient})`};
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  
  ${EventCard}:hover & {
    transform: scale(1.05);
  }
`;

const EventBadge = styled.span`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #7e22ce;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  z-index: 2;
`;

const EventContent = styled.div`
  padding: 1.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const EventTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
  line-height: 1.3;
`;

const EventMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  
  svg {
    color: #7e22ce;
    font-size: 1rem;
  }
`;

const EventDescription = styled.p`
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 1.75rem;
  flex: 1;
`;

const EventActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const EventButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(126, 34, 206, 0.1), 0 2px 4px -1px rgba(126, 34, 206, 0.06);
  
  &:hover {
    background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%);
    box-shadow: 0 10px 15px -3px rgba(126, 34, 206, 0.1), 0 4px 6px -2px rgba(126, 34, 206, 0.05);
    transform: translateY(-2px);
  }
`;

const EventDateBox = styled.div`
  background: #f5f3ff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const EventDateText = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #7e22ce;
  
  span {
    display: block;
    font-size: 0.8rem;
    color: #8b5cf6;
  }
`;


const EtudiantProfil = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [filiereData, setFiliereData] = useState({});
  const [classeData, setClasseData] = useState({});
  const [emploiDuTemps, setEmploiDuTemps] = useState([]);
  

  // Fonction pour charger les données des filières et classes
  const loadReferenceData = async () => {
    try {
      const [filieresRes, classesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/filieres'),
        axios.get('http://localhost:5000/api/classes')
      ]);
  
      const filieresMap = {};
      filieresRes.data.forEach(f => filieresMap[f.id] = f.nom);
      
      const classesMap = {};
      classesRes.data.forEach(c => classesMap[c.id] = c.nom);
  
      setFiliereData(filieresMap);
      setClasseData(classesMap);
    } catch (error) {
      console.error("Erreur chargement données référence:", error);
    }
  };


  const fetchEmploiDuTemps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3001/api/emplois/classe/${studentData.profile.classeNom}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Filtrer seulement les emplois publiés
        const publishedEmplois = response.data.data.filter(emploi => emploi.published);
        setEmploiDuTemps(publishedEmplois);
      }
    } catch (error) {
      console.error("Erreur chargement emploi du temps:", error);
    }
  };

  
  if (studentData?.profile?.classeNom) {
    fetchEmploiDuTemps();
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const cin = localStorage.getItem('studentCin');
        
        if (!token || !cin) {
          navigate('/connexion');
          return;
        }
  
        // Charge d'abord les données de référence
        await loadReferenceData();
  
        const response = await axios.get(`http://localhost:5000/api/etudiant/${cin}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        console.log('Données reçues:', response.data); // Ajoutez ce log pour vérification
  
        if (response.data.success) {
          setStudentData({
            profile: {
              ...response.data.data,
              email: response.data.data.email, // Assurez-vous d'utiliser le bon nom de champ
              filiereNom: filiereData[response.data.data.Filière] || response.data.data.Filière,
              classeNom: classeData[response.data.data.Classe] || response.data.data.Classe,
              photo: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            schedule: [
              { id: 1, jour: 'Lundi', matiere: 'Algorithmique avancée', heure: '08:30-10:00', salle: 'B201', professeur: 'Prof. Martin' },
              { id: 2, jour: 'Lundi', matiere: 'Programmation C++', heure: '10:10-11:40', salle: 'B202', professeur: 'Prof. Dupont' },
              { id: 3, jour: 'Mardi', matiere: 'Base de données', heure: '08:30-10:00', salle: 'A101', professeur: 'Prof. Leroy' },
              { id: 4, jour: 'Mardi', matiere: 'Mathématiques discrètes', heure: '10:10-11:40', salle: 'C301', professeur: 'Prof. Bernard' },
              { id: 5, jour: 'Mercredi', matiere: 'Systèmes d\'exploitation', heure: '13:30-15:00', salle: 'B205', professeur: 'Prof. Moreau' }
            ],
            exams: [
              { id: 1, matiere: 'Algorithmique avancée', date: '2023-06-15', heure: '08:30-10:30', salle: 'Amphi A', coefficient: 2 },
              { id: 2, matiere: 'Base de données NoSQL', date: '2023-06-18', heure: '10:00-12:00', salle: 'Amphi B', coefficient: 1.5 },
              { id: 3, matiere: 'Réseaux et sécurité', date: '2023-06-20', heure: '14:00-16:00', salle: 'Salle C12', coefficient: 1.5 },
              { id: 4, matiere: 'Développement Web React', date: '2023-06-22', heure: '09:00-11:00', salle: 'Salle D08', coefficient: 2 }
            ]
          });
        }  
        const eventsRes = await axios.get("http://localhost:5000/api/evenements");
      setEvents(eventsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [navigate, filiereData, classeData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentCin');
    navigate('/connexion');
  };

  const navigateToDocuments = () => {
    const token = localStorage.getItem('token');
    const cin = localStorage.getItem('studentCin');
    
    if (!token || !cin) {
      navigate('/connexion');
    } else {
      navigate('/studentDoc');
    }
  };
  const handleEventClick = (eventName) => {
    navigate('/eventForm', { state: { selectedEvent: eventName } });
  };


  const getArtGradient = (type) => {
    const gradients = {
      'Conférence': '#8b5cf6, #7c3aed',
      'Atelier': '#ec4899, #db2777',
      'Exposition': '#f59e0b, #d97706',
      'Performance': '#10b981, #059669'
    };
    return gradients[type] || '#6d28d9, #4c1d95';
  };

  
 

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Chargement de votre profil...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Sidebar>
        <NavItem active={activeSection === 'profile'} onClick={() => setActiveSection('profile')}>
          <FaUser /> Profil
        </NavItem>
        <NavItem active={activeSection === 'schedule'} onClick={() => setActiveSection('schedule')}>
          <FaCalendarAlt /> Emploi du temps
        </NavItem>
        <NavItem active={activeSection === 'exams'} onClick={() => setActiveSection('exams')}>
          <FaClipboardList /> Examens
        </NavItem>
        <NavItem active={activeSection === 'events'} onClick={() => setActiveSection('events')}>
          <FaCalendarAlt /> Événements
        </NavItem>
        <NavItem onClick={navigateToDocuments}>
          <FaBookOpen /> Consulter cours
        </NavItem>
      </Sidebar>

      <MainContent>
        <Header>
          <Title>Bienvenue, {studentData?.profile?.Nom_et_prénom}</Title>
          <LogoutButton onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('studentCin');
            navigate('/connexion');
          }}>
            <FaSignOutAlt /> Déconnexion
          </LogoutButton>
        </Header>

        {activeSection === 'profile' && studentData && (
  <Section>
    <SectionTitle>Informations personnelles</SectionTitle>
    <ProfileContainer>
      <ProfilePhoto>
        <img src={studentData.profile.photo} alt="Profil étudiant" />
      </ProfilePhoto>
      <ProfileDetails>
        <DetailItem>
          <DetailLabel>Nom complet</DetailLabel>
          <DetailValue>{studentData.profile.Nom_et_prénom}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>CIN</DetailLabel>
          <DetailValue>{studentData.profile.CIN}</DetailValue>
        </DetailItem>
        <DetailItem>
  <DetailLabel>Email</DetailLabel>
  <DetailValue>
    {studentData.profile.Email || 'Non renseigné'}
  </DetailValue>
</DetailItem>
        <DetailItem>
          <DetailLabel>Téléphone</DetailLabel>
          <DetailValue>{studentData.profile.Téléphone}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>FILIÈRE</DetailLabel>
          <DetailValue>{studentData.profile.filiereNom}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>CLASSE</DetailLabel>
          <DetailValue>{studentData.profile.classeNom}</DetailValue>
        </DetailItem>
      </ProfileDetails>
    </ProfileContainer>
  </Section>
)}

{activeSection === 'schedule' && (
  <Section>
    <SectionTitle>Votre emploi du temps</SectionTitle>
    {emploiDuTemps.length > 0 ? (
      <div>
        <Typography variant="body1" gutterBottom>
          Filière: {emploiDuTemps[0].filiere_nom} - Classe: {emploiDuTemps[0].classe_nom}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<MdGetApp />}
          href={`http://localhost:3001${emploiDuTemps[0].fichier_path}`}
          target="_blank"
          style={{ marginBottom: '1rem' }}
        >
          Télécharger l'emploi du temps
        </Button>
        <iframe 
          src={`http://localhost:3001${emploiDuTemps[0].fichier_path}`} 
          width="100%" 
          height="600px"
          style={{ border: 'none' }}
          title="Emploi du temps"
        />
      </div>
    ) : (
      <Typography variant="body1">Aucun emploi du temps publié pour votre classe.</Typography>
    )}
  </Section>
)}

        {activeSection === 'exams' && (
          <Section>
            <SectionTitle>Vos prochains examens</SectionTitle>
            <ScheduleTable>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matière</th>
                  <th>Heure</th>
                  <th>Salle</th>
                  <th>Coefficient</th>
                </tr>
              </thead>
              <tbody>
                {studentData.exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>
                        {new Date(exam.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#555' }}>
                        {new Date(exam.date).toLocaleDateString('fr-FR', { year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ fontWeight: '500' }}>{exam.matiere}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaClock style={{ color: '#555' }} />
                        {exam.heure}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaMapMarkerAlt style={{ color: '#555' }} />
                        {exam.salle}
                      </div>
                    </td>
                    <td>{exam.coefficient}</td>
                  </tr>
                ))}
              </tbody>
            </ScheduleTable>
          </Section>
        )}

        {activeSection === 'events' && (
           <EventsSection>
    <EventsHeader>
      <EventsTitle>Événements à venir</EventsTitle>
      <EventsSubtitle>
        Découvrez notre programme culturel riche et varié, conçu pour enrichir votre expérience étudiante.
      </EventsSubtitle>
      
      <EventsFilter>
        <FilterButton active>Tous</FilterButton>
        <FilterButton>Conférences</FilterButton>
        <FilterButton>Ateliers</FilterButton>
        <FilterButton>Expositions</FilterButton>
        <FilterButton>Spectacles</FilterButton>
      </EventsFilter>
    </EventsHeader>
    
    <EventsGrid>
      {events.map((event) => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
        const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return (
          <EventCard 
            key={event.id}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <EventImageContainer>
              <EventImage gradient={getArtGradient(event.type)} />
              <EventBadge>{event.type}</EventBadge>
            </EventImageContainer>
            
            <EventContent>
              <EventTitle>{event.titre}</EventTitle>
              
              <EventMeta>
                <MetaItem>
                  <FaCalendarAlt />
                  {formattedDate}
                </MetaItem>
                <MetaItem>
                  <FaClock />
                  {formattedTime}
                </MetaItem>
                <MetaItem>
                  <MdLocationOn />
                  {event.lieu}
                </MetaItem>
              </EventMeta>
              
              <EventDescription>
                {event.description.substring(0, 150)}...
              </EventDescription>
              
              <EventActions>
                <EventDateBox>
                  <FaCalendarAlt size={18} />
                  <EventDateText>
                    {eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    <span>{eventDate.toLocaleDateString('fr-FR', { year: 'numeric' })}</span>
                  </EventDateText>
                </EventDateBox>
                
                <EventButton onClick={() => handleEventClick(event.titre)}>
                  <FaTicketAlt /> Participer
                </EventButton>
              </EventActions>
            </EventContent>
          </EventCard>
        )})}
    </EventsGrid>
  </EventsSection>
        )}
      </MainContent>
    </Container>
  );
};

export default EtudiantProfil;