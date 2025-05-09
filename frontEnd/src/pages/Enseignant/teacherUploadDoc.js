import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Card, List, ListItem, ListItemText, TextField, Typography,
  Select, MenuItem, FormControl, InputLabel, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { Upload as UploadIcon, Description as DescriptionIcon, Edit, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TeacherDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [newDoc, setNewDoc] = useState({
    title: '',
    diffusionDate: new Date(),
    filiere: '',
    parcours: '',
    classe: '',
    matiere: '',
    file: null
  });
  const [editingDoc, setEditingDoc] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Options pour filières, parcours, classes et matières
  const filieres = ['Informatique', 'Mathématiques', 'Physique', 'Chimie'];
  const parcours = {
    'Informatique': ['Développement', 'Réseaux', 'Data Science'],
    'Mathématiques': ['Math Pure', 'Math Appliquée'],
    'Physique': ['Physique Fondamentale', 'Physique Appliquée'],
    'Chimie': ['Chimie Organique', 'Chimie Analytique']
  };
  const classes = ['L1', 'L2', 'L3', 'M1', 'M2'];
  const matieres = {
    'Informatique': {
      'Développement': ['Programmation Web', 'Algorithmique', 'Base de données'],
      'Réseaux': ['Réseaux Informatiques', 'Sécurité'],
      'Data Science': ['Machine Learning', 'Big Data']
    },
    'Mathématiques': {
      'Math Pure': ['Algèbre', 'Analyse'],
      'Math Appliquée': ['Probabilités', 'Statistiques']
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/documents', {
          headers: {
            'Authorization':` Bearer ${localStorage.getItem('teacherToken')}`
          }
        });
        setDocuments(response.data);
      } catch (error) {
        console.error("Erreur de chargement des documents:", error);
        showSnackbar('Erreur de chargement des documents', 'error');
      }
    };
    fetchDocuments();
  }, []);

  const handleFiliereChange = (e) => {
    const filiere = e.target.value;
    setNewDoc({
      ...newDoc,
      filiere,
      parcours: '',
      matiere: ''
    });
  };

  const handleParcoursChange = (e) => {
    const parcours = e.target.value;
    setNewDoc({
      ...newDoc,
      parcours,
      matiere: ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedDoc = editingDoc ? { ...editingDoc } : { ...newDoc };
      updatedDoc.file = file;
      editingDoc ? setEditingDoc(updatedDoc) : setNewDoc(updatedDoc);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newDoc.title);
      formData.append('file', newDoc.file);
      formData.append('filiere', newDoc.filiere);
      formData.append('classe', newDoc.classe);
      formData.append('parcours', newDoc.parcours);
      formData.append('matiere', newDoc.matiere);
      formData.append('diffusionDate', newDoc.diffusionDate.toISOString());

      const response = await axios.post('http://localhost:5000/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`
        }
      });

      setDocuments([response.data, ...documents]);
      showSnackbar('Document publié avec succès', 'success');
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      showSnackbar("Erreur lors de la publication", 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('id', editingDoc.id);
      formData.append('title', editingDoc.title);
      if (editingDoc.file instanceof File) {
        formData.append('file', editingDoc.file);
      }
      formData.append('filiere', editingDoc.filiere);
      formData.append('classe', editingDoc.classe);
      formData.append('parcours', editingDoc.parcours);
      formData.append('matiere', editingDoc.matiere);
      formData.append('diffusionDate', editingDoc.diffusionDate.toISOString());

      const response = await axios.put('http://localhost:5000/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`
        }
      });

      setDocuments(documents.map(doc => doc.id === editingDoc.id ? response.data : doc));
      setOpenDialog(false);
      showSnackbar('Document modifié avec succès', 'success');
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      showSnackbar("Erreur lors de la modification", 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`, {
        headers: {
          'Authorization':` Bearer ${localStorage.getItem('teacherToken')}`
        }
      });
      setDocuments(documents.filter(doc => doc.id !== id));
      showSnackbar('Document supprimé avec succès', 'success');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showSnackbar("Erreur lors de la suppression", 'error');
    }
  };

  const resetForm = () => {
    setNewDoc({
      title: '',
      diffusionDate: new Date(),
      filiere: '',
      parcours: '',
      classe: '',
      matiere: '',
      file: null
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const downloadFile = async (id, fileName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/documents/${id}/download`, {
        responseType: 'blob',
        headers: {
          'Authorization':` Bearer ${localStorage.getItem('teacherToken')}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      showSnackbar("Erreur lors du téléchargement", 'error');
    }
  };

  const openEditDialog = (doc) => {
    setEditingDoc({ 
      ...doc,
      diffusionDate: new Date(doc.diffusionDate),
      file: null // Reset file to allow new upload
    });
    setOpenDialog(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom style={{ marginBottom: '30px' }}>
          Gestion des Documents Pédagogiques
        </Typography>

        {/* Formulaire d'ajout */}
        <Card style={{ padding: '20px', marginBottom: '30px', backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Publier un Nouveau Document
          </Typography>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <TextField
              label="Titre du document*"
              fullWidth
              value={newDoc.title}
              onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
            />
            
            <DatePicker
              label="Date de diffusion*"
              value={newDoc.diffusionDate}
              onChange={(date) => setNewDoc({...newDoc, diffusionDate: date})}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            
            <FormControl fullWidth>
              <InputLabel>Filière*</InputLabel>
              <Select
                value={newDoc.filiere}
                label="Filière*"
                onChange={handleFiliereChange}
              >
                {filieres.map(filiere => (
                  <MenuItem key={filiere} value={filiere}>{filiere}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Parcours*</InputLabel>
              <Select
                value={newDoc.parcours}
                label="Parcours*"
                onChange={handleParcoursChange}
                disabled={!newDoc.filiere}
              >
                {newDoc.filiere && parcours[newDoc.filiere].map(p => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Classe*</InputLabel>
              <Select
                value={newDoc.classe}
                label="Classe*"
                onChange={(e) => setNewDoc({...newDoc, classe: e.target.value})}
              >
                {classes.map(classe => (
                  <MenuItem key={classe} value={classe}>{classe}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Matière*</InputLabel>
              <Select
                value={newDoc.matiere}
                label="Matière*"
                onChange={(e) => setNewDoc({...newDoc, matiere: e.target.value})}
                disabled={!newDoc.parcours}
              >
                {newDoc.filiere && newDoc.parcours && matieres[newDoc.filiere]?.[newDoc.parcours]?.map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          <input
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
            style={{ display: 'none' }}
            id="upload-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-file">
            <Button 
              variant="contained" 
              component="span"
              startIcon={<UploadIcon />}
              style={{ marginRight: '10px' }}
            >
              Sélectionner un Fichier
            </Button>
          </label>
          
          {newDoc.file && (
            <Typography variant="body2" component="span">
              Fichier sélectionné: {newDoc.file.name}
            </Typography>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!newDoc.title || !newDoc.file || !newDoc.filiere || !newDoc.classe || !newDoc.parcours || !newDoc.matiere}
            style={{ marginTop: '20px', float: 'right' }}
          >
            Publier le Document
          </Button>
        </Card>

        {/* Liste des documents */}
        <Typography variant="h5" style={{ margin: '20px 0 10px 0' }}>
          Mes Documents Publiés ({documents.length})
        </Typography>
        
        {documents.length === 0 ? (
          <Typography style={{ textAlign: 'center', margin: '40px 0' }}>
            Aucun document publié pour le moment
          </Typography>
        ) : (
          <List>
            {documents.map((doc) => (
              <Card key={doc.id} style={{ marginBottom: '15px', padding: '10px' }}>
                <ListItem>
                  <DescriptionIcon style={{ marginRight: '15px', fontSize: '40px', color: '#3f51b5' }} />
                  <ListItemText
                    primary={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{doc.title}</span>
                        <span style={{ 
                          backgroundColor: '#e3f2fd', 
                          color: '#1976d2',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}>
                          {doc.filiere} - {doc.parcours} - {doc.classe}
                        </span>
                      </div>
                    }
                    secondary={
                      <>
                        <Typography component="div" variant="body2" color="textSecondary">
                          <div>Matière: {doc.matiere}</div>
                          <div>Date de diffusion: {new Date(doc.diffusionDate).toLocaleDateString()}</div>
                        </Typography>
                        <Typography component="div" variant="caption" color="textSecondary">
                          Publié le: {new Date(doc.createdAt).toLocaleDateString()} | 
                          Taille: {(doc.fileSize / 1024).toFixed(2)} KB | 
                          Type: {doc.fileType.split('/')[1].toUpperCase()}
                        </Typography>
                      </>
                    }
                  />
                  <div>
                    <IconButton onClick={() => openEditDialog(doc)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(doc.id)} color="error">
                      <Delete />
                    </IconButton>
                    <Button
                      variant="outlined"
                      onClick={() => downloadFile(doc.id, doc.fileName)}
                      style={{ marginLeft: '10px' }}
                    >
                      Télécharger
                    </Button>
                  </div>
                </ListItem>
              </Card>
            ))}
          </List>
        )}

        {/* Dialog de modification */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
          <DialogTitle>Modifier le Document</DialogTitle>
          <DialogContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }}>
              <TextField
                label="Titre du document*"
                fullWidth
                value={editingDoc?.title || ''}
                onChange={(e) => setEditingDoc({...editingDoc, title: e.target.value})}
              />
              
              <DatePicker
                label="Date de diffusion*"
                value={editingDoc?.diffusionDate || new Date()}
                onChange={(date) => setEditingDoc({...editingDoc, diffusionDate: date})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              
              <FormControl fullWidth>
                <InputLabel>Filière*</InputLabel>
                <Select
                  value={editingDoc?.filiere || ''}
                  label="Filière*"
                  onChange={(e) => {
                    setEditingDoc({
                      ...editingDoc,
                      filiere: e.target.value,
                      parcours: '',
                      matiere: ''
                    });
                  }}
                >
                  {filieres.map(filiere => (
                    <MenuItem key={filiere} value={filiere}>{filiere}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Parcours*</InputLabel>
                <Select
                  value={editingDoc?.parcours || ''}
                  label="Parcours*"
                  onChange={(e) => {
                    setEditingDoc({
                      ...editingDoc,
                      parcours: e.target.value,
                      matiere: ''
                    });
                  }}
                  disabled={!editingDoc?.filiere}
                >
                  {editingDoc?.filiere && parcours[editingDoc.filiere].map(p => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Classe*</InputLabel>
                <Select
                  value={editingDoc?.classe || ''}
                  label="Classe*"
                  onChange={(e) => setEditingDoc({...editingDoc, classe: e.target.value})}
                >
                  {classes.map(classe => (
                    <MenuItem key={classe} value={classe}>{classe}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Matière*</InputLabel>
                <Select
                  value={editingDoc?.matiere || ''}
                  label="Matière*"
                  onChange={(e) => setEditingDoc({...editingDoc, matiere: e.target.value})}
                  disabled={!editingDoc?.parcours}
                >
                  {editingDoc?.filiere && editingDoc?.parcours && matieres[editingDoc.filiere]?.[editingDoc.parcours]?.map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            <input
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
              style={{ display: 'none' }}
              id="edit-upload-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="edit-upload-file">
              <Button 
                variant="outlined" 
                component="span"
                startIcon={<UploadIcon />}
                style={{ marginRight: '10px' }}
              >
                Changer le Fichier
              </Button>
            </label>
            
            {editingDoc?.fileName && !editingDoc?.file && (
              <Typography variant="body2" component="span">
                Fichier actuel: {editingDoc.fileName}
              </Typography>
            )}
            {editingDoc?.file && (
              <Typography variant="body2" component="span">
                Nouveau fichier sélectionné: {editingDoc.file.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button 
              onClick={handleUpdate}
              disabled={!editingDoc?.title || (!editingDoc?.file && !editingDoc?.fileName) || 
                       !editingDoc?.filiere || !editingDoc?.classe || !editingDoc?.parcours || !editingDoc?.matiere}
              color="primary"
            >
              Enregistrer les modifications
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({...snackbar, open: false})}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default TeacherDocuments;