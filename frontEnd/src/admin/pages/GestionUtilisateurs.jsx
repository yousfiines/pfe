import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, MenuItem, Select,
  FormControl, InputLabel, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const GestionUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ Cin: '', Nom_et_prénom: '', email: '', type: 'étudiant' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/utilisateurs');
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs :", error);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({ Cin: '', Nom_et_prénom: '', email: '', type: 'étudiant' });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/utilisateurs', formData);
      fetchUtilisateurs();
      handleCloseDialog();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors de l'enregistrement.");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/utilisateurs/${id}`);
      fetchUtilisateurs();
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.Nom_et_prénom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Gestion des Utilisateurs</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Rechercher"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Ajouter un utilisateur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CIN</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.Cin}</TableCell>
                <TableCell>{user.Nom_et_prénom}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}><Delete color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{currentUser ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth margin="normal" label="CIN"
            name="Cin" value={formData.Cin} onChange={handleChange}
          />
          <TextField
            fullWidth margin="normal" label="Nom et Prénom"
            name="Nom_et_prénom" value={formData.Nom_et_prénom} onChange={handleChange}
          />
          <TextField
            fullWidth margin="normal" label="Email"
            name="email" value={formData.email} onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="Type"
              onChange={handleChange}
            >
              <MenuItem value="étudiant">Étudiant</MenuItem>
              <MenuItem value="enseignant">Enseignant</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {currentUser ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionUtilisateurs;
