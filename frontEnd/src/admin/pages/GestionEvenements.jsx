import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Chip
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const GestionEvenements = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([
    { id: 1, titre: 'Conférence sur l\'IA', date: new Date('2023-06-15'), lieu: 'Amphi A', type: 'Conférence' },
    { id: 2, titre: 'Atelier de programmation', date: new Date('2023-06-20'), lieu: 'Salle 101', type: 'Atelier' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ titre: '', date: null, lieu: '', type: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const handleOpenDialog = (event = null) => {
    setFormData(event || { titre: '', date: null, lieu: '', type: '', description: '' });
    setEditingId(event?.id || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, date: newDate });
  };

  const handleSubmit = () => {
    if (editingId) {
      setEvents(events.map(e => e.id === editingId ? { ...formData, id: editingId } : e));
    } else {
      const newId = Math.max(...events.map(e => e.id)) + 1;
      setEvents([...events, { ...formData, id: newId }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>Gestion des Événements</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Ajouter un événement
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.titre}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.lieu}</TableCell>
                <TableCell>
                  <Chip label={event.type} color={event.type === 'Conférence' ? 'primary' : 'secondary'} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(event)}><Edit color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(event.id)}><Delete color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? 'Modifier un événement' : 'Ajouter un événement'}</DialogTitle>
        <DialogContent>
          <TextField label="Titre" name="titre" fullWidth margin="normal" value={formData.titre} onChange={handleChange} />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>
          <TextField label="Lieu" name="lieu" fullWidth margin="normal" value={formData.lieu} onChange={handleChange} />
          <TextField label="Type" name="type" fullWidth margin="normal" value={formData.type} onChange={handleChange} />
          <TextField label="Description" name="description" fullWidth multiline rows={4} margin="normal" value={formData.description} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionEvenements;
