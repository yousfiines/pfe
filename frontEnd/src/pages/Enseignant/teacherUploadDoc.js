import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Card, List, ListItem, ListItemText, TextField, Typography,
  Select, MenuItem, FormControl, InputLabel, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  Chip, Avatar, Divider, LinearProgress
} from '@mui/material';
import {
  Upload as UploadIcon, Description as DescriptionIcon, 
  Edit, Delete, School, Category, Today, Class, Subject
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import logoFac from "./../../assets/logoFac.png";
import { Download as DownloadIcon } from '@mui/icons-material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

const TeacherDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [teachingData, setTeachingData] = useState({
    filieres: [],
    classes: [],
    matieres: []
  });
  const [loading, setLoading] = useState(true);
  
  const [newDoc, setNewDoc] = useState({
    title: '',
    filiere_id: '',
    classe_id: '',
    matiere_id: '',
    file: null
  });
  
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

const StyledCard = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;
  
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        console.warn("Aucun token trouvé - Mode consultation seule");
        return;
      }

      // Charger les documents de l'enseignant
      const docsResponse = await axios.get('http://localhost:5000/api/teacher-documents', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setDocuments(docsResponse.data.data || []);

      // Charger les données pédagogiques (filieres, classes, matieres)
      const teachingResponse = await axios.get('http://localhost:5000/api/teaching-data');
      setTeachingData(teachingResponse.data.data);

    } catch (error) {
      console.error("Erreur de chargement:", error);
      if (error.response?.status === 401) {
        console.warn("Session expirée - Mode consultation seule");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const handleFiliereChange = (e) => {
    const filiere_id = e.target.value;
    setNewDoc({
      ...newDoc,
      filiere_id,
      classe_id: '',
      matiere_id: ''
    });
  };

  const handleClasseChange = (e) => {
    const classe_id = e.target.value;
    setNewDoc({
      ...newDoc,
      classe_id,
      matiere_id: ''
    });
  };

  const handleFileChange = (e) => {
    setNewDoc({
      ...newDoc,
      file: e.target.files[0]
    });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newDoc.title);
      formData.append('filiere_id', newDoc.filiere_id);
      formData.append('classe_id', newDoc.classe_id);
      formData.append('matiere_id', newDoc.matiere_id);
      formData.append('file', newDoc.file);

      const response = await axios.post('http://localhost:5000/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`
        }
      });

      setDocuments([response.data.data, ...documents]);
      showSnackbar('Document publié avec succès', 'success');
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      showSnackbar("Erreur lors de la publication", 'error');
    }
  };

  const downloadFile = async (file_path, file_name) => {
    try {
      window.open(`http://localhost:5000${file_path}`, '_blank');
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      showSnackbar("Erreur lors du téléchargement", 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`
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
      filiere_id: '',
      classe_id: '',
      matiere_id: '',
      file: null
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

// Filtrage des classes
const getClassesByFiliere = (filiereId) => {
  return teachingData.classes.filter(c => c.filiere_id == filiereId);
}

// Filtrage des matières
const getMatieresByClasse = (classeId) => {
  return teachingData.matieres.filter(m => m.classe.id == classeId);
}

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LinearProgress style={{ width: '50%' }} />
      </div>
    );
  }

  

  return (

<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
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

      </header>

<LocalizationProvider dateAdapter={AdapterDateFns}>
        <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <School sx={{ fontSize: 40, color: '#1A237E', mr: 2 }} />
            <Typography variant="h4" style={{ fontWeight: 700, color: '#1A237E' }}>
              Gestion des Ressources Pédagogiques
            </Typography>
          </div>

          {/* Nouveau formulaire avec icônes */}
          <StyledCard style={{ padding: '32px', marginBottom: '40px' }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: '32px' }}>
              <Edit sx={{ mr: 1, color: '#2196F3' }} /> Publier une nouvelle ressource
            </Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <TextField
                label="Titre du document"
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
                value={newDoc.title}
                onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
              />
              
              <DatePicker
                label="Date de diffusion"
                value={newDoc.diffusionDate}
                onChange={(date) => setNewDoc({...newDoc, diffusionDate: date})}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    InputProps={{
                      startAdornment: <Today sx={{ color: 'action.active', mr: 1 }} />
                    }}
                  />
                )}
              />
              
              <FormControl fullWidth>
  <InputLabel>Filière</InputLabel>
  <Select
    value={newDoc.filiere_id}
    label="Filière"
    onChange={handleFiliereChange}
  >
    {teachingData.filieres.map(filiere => (
      <MenuItem key={filiere.id} value={filiere.id}>
        {filiere.nom}
      </MenuItem>
    ))}
  </Select>
</FormControl>

{/* Sélecteur de Classe */}
<FormControl fullWidth>
  <InputLabel>Classe</InputLabel>
  <Select
    value={newDoc.classe_id}
    label="Classe"
    onChange={handleClasseChange}
    disabled={!newDoc.filiere_id}
  >
    {getClassesByFiliere(newDoc.filiere_id).map(classe => (
      <MenuItem key={classe.id} value={classe.id}>
        {classe.nom} ({classe.filiere_nom})
      </MenuItem>
    ))}
  </Select>
</FormControl>

{/* Sélecteur de Matière */}
<FormControl fullWidth>
  <InputLabel>Matière</InputLabel>
  <Select
    value={newDoc.matiere_id}
    label="Matière"
    onChange={(e) => setNewDoc({...newDoc, matiere_id: e.target.value})}
    disabled={!newDoc.classe_id}
  >
    {getMatieresByClasse(newDoc.classe_id).map(matiere => (
      <MenuItem key={matiere.id} value={matiere.id}>
        {matiere.nom} (S{matiere.semestre_numero})
      </MenuItem>
    ))}
  </Select>
</FormControl>
            </div>

            <Divider sx={{ my: 3 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                >
                  Sélectionner un fichier
                </Button>
              </label>
              
              {newDoc.file && (
                <Chip
                  label={newDoc.file.name}
                  onDelete={() => setNewDoc({...newDoc, file: null})}
                  variant="outlined"
                  color="primary"
                />
              )}
            </div>

           <Button
  variant="contained"
  color="primary"
  onClick={handleSubmit}
  disabled={
    !newDoc.title || 
    !newDoc.file || 
    !newDoc.filiere_id || 
    !newDoc.classe_id || 
    !newDoc.matiere_id ||
    teachingData.filieres.length === 0
  }
>
  Publier la ressource
</Button>
          </StyledCard>

          {/* Liste des documents */}
          <Typography variant="h5" style={{ fontWeight: 600, margin: '40px 0 24px 0' }}>
            Mes ressources publiées
          </Typography>
          
          {documents.length === 0 ? (
            <Typography variant="body1" color="textSecondary">
              Aucun document publié pour le moment
            </Typography>
          ) : (
            <List>
              {documents.map((doc) => (
                <Card key={doc.id} style={{ marginBottom: '16px' }}>
                  <ListItem>
                    <ListItemText
                      primary={doc.title}
                      secondary={
                        <>
                          <div>
                            {doc.filiere_nom} - {doc.classe_nom} - {doc.matiere_nom}
                          </div>
                          <div>
                            Publié le {new Date(doc.diffusion_date).toLocaleDateString()} | 
                            {doc.file_type} ({Math.round(doc.file_size / 1024)} KB)
                          </div>
                        </>
                      }
                    />
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadFile(doc.file_path, doc.file_name)}
                    >
                      Télécharger
                    </Button>
                    <IconButton onClick={() => handleDelete(doc.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </ListItem>
                </Card>
              ))}
            </List>
          )}

{loading && (
  <div style={{ textAlign: 'center', margin: '20px 0' }}>
    <CircularProgress />
    <Typography variant="body2" color="textSecondary">
      Chargement des données pédagogiques...
    </Typography>
  </div>
)}

{!loading && teachingData.filieres.length === 0 && (
  <Alert severity="error" style={{ margin: '20px 0' }}>
    Aucune donnée pédagogique disponible - Veuillez contacter l'administration
  </Alert>
)}
          {/* Snackbar pour les notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({...snackbar, open: false})}
          >
            <Alert severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </LocalizationProvider>
    </div>
  );
};


export default TeacherDocuments;