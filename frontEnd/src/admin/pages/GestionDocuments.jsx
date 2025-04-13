import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack, CloudUpload } from '@mui/icons-material';

const GestionDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([
    { id: 1, titre: 'Introduction à React', type: 'Cours', formation: 'Licence Informatique', date: '2023-05-15' },
    { id: 2, titre: 'TP Algorithmique', type: 'TP', formation: 'Licence Mathématiques', date: '2023-05-10' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);

  const handleOpenDialog = (doc = null) => {
    setCurrentDoc(doc);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>
        Gestion des Documents
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Ajouter un document
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Formation</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.titre}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.formation}</TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(doc)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(doc.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentDoc ? 'Modifier un document' : 'Ajouter un nouveau document'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Titre du document"
              defaultValue={currentDoc?.titre || ''}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Type de document</InputLabel>
              <Select
                label="Type de document"
                defaultValue={currentDoc?.type || 'Cours'}
              >
                <MenuItem value="Cours">Cours</MenuItem>
                <MenuItem value="TD">Travaux Dirigés</MenuItem>
                <MenuItem value="TP">Travaux Pratiques</MenuItem>
                <MenuItem value="Examen">Examen</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              fullWidth
              label="Formation concernée"
              defaultValue={currentDoc?.formation || ''}
            />
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Téléverser le document
              <input type="file" hidden />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {currentDoc ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionDocuments;