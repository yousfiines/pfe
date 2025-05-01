import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { FaCalendarAlt, FaClock } from "react-icons/fa";

import styled, { keyframes } from 'styled-components';
import { 
  FaUser, 
  FaClipboardList, 
  FaSignOutAlt, 
  FaMapMarkerAlt, 
  FaWeight,
 
  FaBookOpen
} from 'react-icons/fa';

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
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
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

const EtudiantProfil = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const cin = localStorage.getItem('studentCin');
        
        if (!token || !cin) {
          navigate('/connexion');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/etudiant/${cin}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setStudentData({
            profile: {
              nom: response.data.data.Nom_et_prénom,
              cin: response.data.data.CIN,
              email: response.data.data.Email,
              telephone: response.data.data.Téléphone,
              filiere: response.data.data.Filière,
              classe: response.data.data.Classe,
              photo: 'https://randomuser.me/api/portraits/men/32.jpg' // Photo par défaut
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
        } else {
          setError(response.data.message || "Erreur lors du chargement des données");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.response?.data?.message || "Erreur serveur");
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('studentCin');
          navigate('/connexion');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentCin');
    navigate('/connexion');
  };

  const navigateToDocuments = () => {
    navigate('/studentDoc');
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
        <NavItem 
          active={activeSection === 'profile'} 
          onClick={() => setActiveSection('profile')}
        >
          <FaUser /> Profil
        </NavItem>
        <NavItem 
          active={activeSection === 'schedule'} 
          onClick={() => setActiveSection('schedule')}
        >
          <FaCalendarAlt /> Emploi du temps
        </NavItem>
        <NavItem 
          active={activeSection === 'exams'} 
          onClick={() => setActiveSection('exams')}
        >
          <FaClipboardList /> Examens
        </NavItem>
        <NavItem 
          onClick={navigateToDocuments}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >

          <FaBookOpen />
         Consulter cours 
      
       </NavItem>
      </Sidebar>

      <MainContent>
        <Header>
          <Title>Bienvenue, {studentData.profile.prenom}</Title>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Déconnexion
          </LogoutButton>
        </Header>

        
{activeSection === 'profile' && (
  <Section>
    <SectionTitle>Informations personnelles</SectionTitle>
    <ProfileContainer>
      <ProfilePhoto>
        <img src={studentData.profile.photo} alt="Profil étudiant" />
      </ProfilePhoto>
      <ProfileDetails>
        <DetailItem>
          <DetailLabel>Nom complet</DetailLabel>
          <DetailValue>{studentData.profile.nom}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>CIN</DetailLabel>
          <DetailValue>{studentData.profile.cin}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Email</DetailLabel>
          <DetailValue>{studentData.profile.email}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Téléphone</DetailLabel>
          <DetailValue>{studentData.profile.telephone}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Filière</DetailLabel>
          <DetailValue>{studentData.profile.filiere}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Classe</DetailLabel>
          <DetailValue>{studentData.profile.classe}</DetailValue>
        </DetailItem>
      </ProfileDetails>
    </ProfileContainer>
  </Section>
)}

        {activeSection === 'schedule' && (
          <Section>
            <SectionTitle>Votre emploi du temps</SectionTitle>
            <ScheduleTable>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>08:30-10:00</th>
                  <th>10:10-11:40</th>
                  <th>13:30-15:00</th>
                  <th>15:10-16:40</th>
                  <th>16:50-18:20</th>
                </tr>
              </thead>
              <tbody>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((jour) => (
                  <tr key={jour}>
                    <td>{jour}</td>
                    {['08:30-10:00', '10:10-11:40', '13:30-15:00', '15:10-16:40', '16:50-18:20'].map((horaire) => {
                      const cours = studentData.schedule.find(
                        (c) => c.jour === jour && c.heure === horaire
                      );
                      return (
                        <td key={`${jour}-${horaire}`}>
                          {cours ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>{cours.matiere}</span>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.8rem', color: '#555' }}>{cours.professeur}</span>
                                <span style={{ fontSize: '0.7rem', color: '#777', fontStyle: 'italic' }}>{cours.salle}</span>
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </ScheduleTable>
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
      </MainContent>
    </Container>
  );
};

export default EtudiantProfil;