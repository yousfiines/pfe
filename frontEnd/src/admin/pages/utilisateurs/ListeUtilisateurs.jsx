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
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, deleteUser, updateUserRole } from '../../../services/apiUtilisateurs';

const ListeUtilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const chargerUtilisateurs = async () => {
      try {
        const data = await fetchUsers();
        setUtilisateurs(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setChargement(false);
      }
    };
    chargerUtilisateurs();
  }, []);

  const filtrerUtilisateurs = utilisateurs.filter(user =>
    `${user.prenom} ${user.nom}`.toLowerCase().includes(recherche.toLowerCase()) ||
    user.email.toLowerCase().includes(recherche.toLowerCase())
  );

  const handleChangerRole = async (userId, nouveauRole) => {
    try {
      await updateUserRole(userId, nouveauRole);
      setUtilisateurs(utilisateurs.map(user =>
        user._id === userId ? { ...user, role: nouveauRole } : user
      ));
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSupprimer = async (userId) => {
    if (window.confirm("Confirmer la suppression de cet utilisateur ?")) {
      try {
        await deleteUser(userId);
        setUtilisateurs(utilisateurs.filter(user => user._id !== userId));
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des utilisateurs</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/utilisateurs/nouveau')}
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Rechercher un utilisateur"
        variant="outlined"
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
        }}
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {chargement ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrerUtilisateurs.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.prenom} {user.nom}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rôle</InputLabel>
                      <Select
                        value={user.role}
                        label="Rôle"
                        onChange={(e) => handleChangerRole(user._id, e.target.value)}
                      >
                        <MenuItem value="etudiant">Étudiant</MenuItem>
                        <MenuItem value="enseignant">Enseignant</MenuItem>
                        <MenuItem value="admin">Administrateur</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => navigate(`/admin/utilisateurs/${user._id}/modifier`)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleSupprimer(user._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListeUtilisateurs;