import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Card, List, ListItem, ListItemText, TextField, Typography,
  Select, MenuItem, FormControl, InputLabel, IconButton, 
  Snackbar, Alert,
  Chip,  Divider, 
} from '@mui/material';
import {
  Upload as UploadIcon, Description as  
  Edit, Delete
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});
const StyledCard = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;
const TeacherDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [teachingData, setTeachingData] = useState({
    filieres: [],
    classes: [],
    matieres: [],
    semestres: []
  });
  const [loading, setLoading] = useState(true);
  const [teachingLoading, setTeachingLoading] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("teacherCin"));
  const [newDoc, setNewDoc] = useState({
    title: '',
    enseignant_id: storedUser,
    filiere_id: '',
    classe_id: '',
    matiere_id: '',
    diffusionDate: new Date(),
    file: null
  });
  const [darkMode, setDarkMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    // Récupérer l'ID de l'enseignant depuis le token
    const token = localStorage.getItem('teacherToken');
    if (token) {
      const decoded = jwtDecode(token);
      setNewDoc(prev => ({...prev, enseignant_id: decoded.cin}));
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teaching-data');
        setTeachingData({
          filieres: response.data.data.filieres || [],
          classes: response.data.data.classes || [],
          matieres: response.data.data.matieres || [],
          semestres: response.data.data.semestres || []
        });
      } catch (error) {
        console.error("Erreur:", error);
        setSnackbar({
          open: true,
          message: "Erreur lors du chargement des données",
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#f8f9fa',
    textColor: darkMode ? '#ffffff' : '#000000',
    navbarBg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#ffffff',
    textSecondary: darkMode ? '#bbbbbb' : '#555555',
    borderColor: darkMode ? '#444444' : '#e0e0e0',
    primaryColor: darkMode ? '#4a8fd2' : '#0056b3',
    secondaryColor: darkMode ? '#f1c40f' : '#f1c40f',
    inputBg: darkMode ? '#3d3d3d' : '#ffffff',
    inputBorder: darkMode ? '#555555' : '#dddddd',
    buttonHover: darkMode ? '#3a7bbd' : '#0069d9',
    errorColor: '#ff6b6b',
    tableHeaderBg: darkMode ? '#333333' : '#f5f5f5',
    tableRowBg: darkMode ? '#2d2d2d' : '#ffffff',
    tableBorder: darkMode ? '#444444' : '#dddddd'
  };


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
      formData.append('enseignant_id', newDoc.enseignant_id);
      formData.append('filiere_id', newDoc.filiere_id);
      formData.append('classe_id', newDoc.classe_id);
      formData.append('matiere_id', newDoc.matiere_id);
      formData.append("date_diffusion", newDoc.diffusionDate?.toISOString().split("T")[0]);
      formData.append('file', newDoc.file);
      const response = await axios.post(
        'http://localhost:5000/api/diffuseCours', 
       formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Document publié avec succès!',
          severity: 'success'
        });
        resetForm();
        // Recharger les documents
        fetchDocuments();
      }
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 
                error.message || 
                "Erreur lors de la publication",
        severity: 'error'
      });
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/teacher-documents');
      setDocuments(response.data.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const downloadFile = async (id, fileName) => {
    try {
      const response = await api.get(`/api/documents/${id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur:", error);
      showSnackbar(error.response?.data?.message || "Erreur lors du téléchargement", 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/documents/${id}`);
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
      enseignant_id: newDoc.enseignant_id, // Garder l'ID enseignant
      filiere_id: '',
      classe_id: '',
      matiere_id: '',
      diffusionDate: new Date(),
      file: null
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/connexion';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: themeStyles.backgroundColor,
      color: themeStyles.textColor,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Header et autres éléments UI... */}
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div style={{ 
          padding: '32px', 
          maxWidth: '1280px', 
          margin: '0 auto',
          backgroundColor: themeStyles.backgroundColor,
          color: themeStyles.textColor
        }}>
          {/* Formulaire de publication */}
          <StyledCard style={{ padding: '32px', marginBottom: '40px' }}>
            <Typography variant="h6" gutterBottom style={{ 
              fontWeight: 600, 
              marginBottom: '32px',
              color: themeStyles.textColor
            }}>
              <Edit sx={{ mr: 1, color: themeStyles.primaryColor }} /> Publier une nouvelle ressource
            </Typography>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px'
            }}>
              <TextField
                label="Titre du document"
                fullWidth
                variant="outlined"
                value={newDoc.title}
                onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeStyles.inputBorder,
                    },
                    '&:hover fieldset': {
                      borderColor: themeStyles.primaryColor,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeStyles.textSecondary,
                  },
                  '& .MuiInputBase-input': {
                    color: themeStyles.textColor,
                  },
                  backgroundColor: themeStyles.inputBg
                }}
              />
             
              <DatePicker
                label="Date de diffusion"
                value={newDoc.diffusionDate}
                onChange={(date) => setNewDoc({...newDoc, diffusionDate: date})}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: themeStyles.inputBorder,
                        },
                        '&:hover fieldset': {
                          borderColor: themeStyles.primaryColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: themeStyles.textSecondary,
                      },
                      '& .MuiInputBase-input': {
                        color: themeStyles.textColor,
                      },
                      backgroundColor: themeStyles.inputBg
                    }
                  }
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel sx={{ color: themeStyles.textSecondary }}>Filière</InputLabel>
                <Select
                  value={newDoc.filiere_id}
                  label="Filière"
                  onChange={handleFiliereChange}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeStyles.inputBorder,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeStyles.primaryColor,
                    },
                    '& .MuiSelect-icon': {
                      color: themeStyles.textSecondary,
                    },
                    '& .MuiSelect-select': {
                      color: themeStyles.textColor,
                    },
                    backgroundColor: themeStyles.inputBg
                  }}
                >
                  {teachingData.filieres.map((filiere) => (
                    <MenuItem key={filiere.id} value={filiere.id}>
                      {filiere.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: themeStyles.textSecondary }}>Classe</InputLabel>
                <Select
                  value={newDoc.classe_id}
                  label="Classe"
                  onChange={handleClasseChange}
                  disabled={!newDoc.filiere_id}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeStyles.inputBorder,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeStyles.primaryColor,
                    },
                    '& .MuiSelect-icon': {
                      color: themeStyles.textSecondary,
                    },
                    '& .MuiSelect-select': {
                      color: themeStyles.textColor,
                    },
                    backgroundColor: themeStyles.inputBg
                  }}
                >
                  {teachingData.classes
                    .filter(classe => classe.filiere_id === newDoc.filiere_id)
                    .map(classe => (
                      <MenuItem key={classe.id} value={classe.id}>
                        {classe.nom}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
  <InputLabel>Matière</InputLabel>
  <Select
    value={newDoc.matiere_id}
    label="Matière"
    onChange={(e) => setNewDoc({...newDoc, matiere_id: e.target.value})}
    disabled={!newDoc.classe_id}
  >
    {teachingData.matieres
      .filter(matiere => {
        const semestre = teachingData.semestres.find(s => s.id === matiere.semestre_id);
        return semestre && semestre.classe_id.toString() === newDoc.classe_id.toString();
      })
      .map(matiere => (
        <MenuItem key={matiere.id} value={matiere.id}>
          {matiere.nom} (S{matiere.semestre_numero})
        </MenuItem>
      ))}
  </Select>
</FormControl>
            </div>

            <Divider sx={{ 
              my: 3,
              backgroundColor: themeStyles.borderColor
            }} />

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
                  sx={{
                    backgroundColor: themeStyles.primaryColor,
                    '&:hover': {
                      backgroundColor: themeStyles.buttonHover
                    }
                  }}
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
                  sx={{
                    color: themeStyles.textColor,
                    borderColor: themeStyles.primaryColor,
                    '& .MuiChip-deleteIcon': {
                      color: themeStyles.textSecondary
                    }
                  }}
                />
              )}
            </div>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              style={{ marginTop: '16px' }}
              sx={{
                backgroundColor: themeStyles.primaryColor,
                '&:hover': {
                  backgroundColor: themeStyles.buttonHover
                },
                '&:disabled': {
                  backgroundColor: darkMode ? '#555555' : '#e0e0e0',
                  color: darkMode ? '#bbbbbb' : '#9e9e9e'
                }
              }}
            >
              Publier
            </Button>
          </StyledCard>

          {/* Liste des documents publiés */}
          <Typography variant="h5" style={{ 
            fontWeight: 600, 
            margin: '40px 0 24px 0',
            color: themeStyles.textColor
          }}>
            Mes ressources publiées
          </Typography>
          
          {documents.length === 0 ? (
            <Typography variant="body1" sx={{ color: themeStyles.textSecondary }}>
              Aucun document publié pour le moment
            </Typography>
          ) : (
            <List>
              {documents.map((doc) => (
                <Card key={doc.id} style={{ 
                  marginBottom: '16px',
                  backgroundColor: themeStyles.cardBg,
                  border: `1px solid ${themeStyles.borderColor}`
                }}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: themeStyles.textColor }}>
                          {doc.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <div style={{ color: themeStyles.textSecondary }}>
                            {doc.filiere_nom} - {doc.classe_nom} - {doc.matiere_nom}
                          </div>
                          <div style={{ color: themeStyles.textSecondary }}>
                            Publié le {new Date(doc.diffusion_date).toLocaleDateString()} | 
                            {doc.file_type} ({Math.round(doc.file_size / 1024)} KB)
                          </div>
                        </>
                      }
                    />
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadFile(doc.file_path, doc.file_name)}
                      sx={{
                        color: themeStyles.primaryColor,
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(74, 143, 210, 0.1)' : 'rgba(0, 86, 179, 0.1)'
                        }
                      }}
                    >
                      Télécharger
                    </Button>
                    <IconButton 
                      onClick={() => handleDelete(doc.id)}
                      sx={{
                        color: themeStyles.errorColor,
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.1)'
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                </Card>
              ))}
            </List>
          )}

          {teachingLoading && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <CircularProgress sx={{ color: themeStyles.primaryColor }} />
              <Typography variant="body2" sx={{ color: themeStyles.textSecondary }}>
                Chargement des données pédagogiques...
              </Typography>
            </div>
          )}

          {!loading && teachingData.filieres.length === 0 && (
            <Alert severity="error" style={{ 
              margin: '20px 0',
              backgroundColor: darkMode ? '#2d2d2d' : '#fdecea',
              color: themeStyles.textColor
            }}>
              Aucune donnée pédagogique disponible - Veuillez contacter l'administration
            </Alert>
          )}

          {/* Snackbar pour les notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert 
              severity={snackbar.severity}
              onClose={handleCloseSnackbar}
              sx={{
                backgroundColor: snackbar.severity === 'error' ? 
                  (darkMode ? '#2d0000' : '#fdecea') : 
                  (darkMode ? '#002d00' : '#edf7ed'),
                color: snackbar.severity === 'error' ? 
                  (darkMode ? '#ff6b6b' : '#5f2120') : 
                  (darkMode ? '#4caf50' : '#1e4620')
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default TeacherDocuments;