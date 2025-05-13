// pages/Admin/GestionCalendrierExamens.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const Calendrier= () => {
  const [exams, setExams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get('/api/exams');
      setExams(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handlePublish = async () => {
    try {
      await axios.post('/api/exams/publish');
      fetchExams();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/exams/${id}`);
      fetchExams();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const calendarEvents = exams.map(exam => ({
    title: exam.matiere,
    start: exam.date,
    end: exam.date,
    extendedProps: {
      salle: exam.salle,
      professeur: exam.professeur
    }
  }));

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Calendrier des examens</Typography>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Ajouter examen
          </Button>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
            sx={{ ml: 2 }}
          >
            Publier calendrier
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={calendarEvents}
            locale="fr"
            height="auto"
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matière</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Salle</TableCell>
                <TableCell>Professeur</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map(exam => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.matiere}</TableCell>
                  <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                  <TableCell>{exam.salle}</TableCell>
                  <TableCell>{exam.professeur}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setCurrentExam(exam);
                        setOpenDialog(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(exam.id)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog pour ajouter/modifier */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {currentExam ? 'Modifier examen' : 'Ajouter un examen'}
          </DialogTitle>
          <DialogContent>
            {/* Formulaire d'édition ici */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button variant="contained">Enregistrer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default Calendrier;