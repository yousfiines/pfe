import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoFac from "./../assets/logoFac.png";
import Lottie from "lottie-react";
import home from "./../assets/lotties/home.json";
import { FaChalkboardTeacher, FaCalendarAlt, FaClock, FaBook, FaGraduationCap, FaUniversity } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styled, { keyframes } from 'styled-components';
import { 
  FaUser, 
  FaClipboardList, 
  FaSignOutAlt, 
  FaMapMarkerAlt, 
  FaWeight 
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

  useEffect(() => {
    // Simulation de chargement des données
    const fetchData = async () => {
      setTimeout(() => {
        setStudentData({
          profile: {
            nom: 'Dupont',
            prenom: 'Jean',
            matricule: 'ET2023001',
            email: 'jean.dupont@universite.com',
            telephone: '+33 6 12 34 56 78',
            filiere: 'Licence Informatique',
            niveau: 'L3',
            dateNaissance: '15/03/2000',
            adresse: '12 Rue des Écoles, Paris',
            photo: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          schedule: [
            { id: 1, jour: 'Lundi', matiere: 'Algorithmique avancée', heure: '08:00-10:00', salle: 'B201', professeur: 'Prof. Martin' },
            { id: 2, jour: 'Mardi', matiere: 'Base de données NoSQL', heure: '10:00-12:00', salle: 'A102', professeur: 'Prof. Dubois' },
            { id: 3, jour: 'Mercredi', matiere: 'Réseaux et sécurité', heure: '14:00-16:00', salle: 'C305', professeur: 'Prof. Leroy' },
            { id: 4, jour: 'Jeudi', matiere: 'Développement Web React', heure: '09:00-11:00', salle: 'D404', professeur: 'Prof. Moreau' },
            { id: 5, jour: 'Vendredi', matiere: 'Systèmes distribués', heure: '13:00-15:00', salle: 'B201', professeur: 'Prof. Simon' }
          ],
          exams: [
            { id: 1, matiere: 'Algorithmique avancée', date: '2023-06-15', heure: '08:30-10:30', salle: 'Amphi A', coefficient: 2 },
            { id: 2, matiere: 'Base de données NoSQL', date: '2023-06-18', heure: '10:00-12:00', salle: 'Amphi B', coefficient: 1.5 },
            { id: 3, matiere: 'Réseaux et sécurité', date: '2023-06-20', heure: '14:00-16:00', salle: 'Salle C12', coefficient: 1.5 },
            { id: 4, matiere: 'Développement Web React', date: '2023-06-22', heure: '09:00-11:00', salle: 'Salle D08', coefficient: 2 }
          ]
        });
      }, 1000);
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/login');
  };

  if (!studentData) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Chargement de votre profil...</p>
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
                  <DetailValue>{studentData.profile.prenom} {studentData.profile.nom}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Matricule</DetailLabel>
                  <DetailValue>{studentData.profile.matricule}</DetailValue>
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
                  <DetailLabel>Niveau</DetailLabel>
                  <DetailValue>{studentData.profile.niveau}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Date de naissance</DetailLabel>
                  <DetailValue>{studentData.profile.dateNaissance}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Adresse</DetailLabel>
                  <DetailValue>{studentData.profile.adresse}</DetailValue>
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
                  <th>Matière</th>
                  <th>Heure</th>
                  <th>Salle</th>
                  <th>Professeur</th>
                </tr>
              </thead>
              <tbody>
                {studentData.schedule.map((course) => (
                  <tr key={course.id}>
                    <td>{course.jour}</td>
                    <td>{course.matiere}</td>
                    <td>{course.heure}</td>
                    <td>{course.salle}</td>
                    <td>{course.professeur}</td>
                  </tr>
                ))}
              </tbody>
            </ScheduleTable>
          </Section>
        )}

        {activeSection === 'exams' && (
          <Section>
            <SectionTitle>Vos prochains examens</SectionTitle>
            <ExamsGrid>
              {studentData.exams.map((exam) => (
                <ExamCard key={exam.id}>
                  <ExamDate>
                    <ExamDay>{new Date(exam.date).getDate()}</ExamDay>
                    <ExamMonth>
                      {new Date(exam.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </ExamMonth>
                  </ExamDate>
                  <ExamInfo>
                    <ExamTitle>{exam.matiere}</ExamTitle>
                    <ExamDetail>
                      <FaClock /> {exam.heure}
                    </ExamDetail>
                    <ExamDetail>
                      <FaMapMarkerAlt /> {exam.salle}
                    </ExamDetail>
                    <ExamDetail>
                      <FaWeight /> Coefficient: {exam.coefficient}
                    </ExamDetail>
                  </ExamInfo>
                </ExamCard>
              ))}
            </ExamsGrid>
          </Section>
        )}
      </MainContent>
    </Container>
  );
};


export default EtudiantProfil;