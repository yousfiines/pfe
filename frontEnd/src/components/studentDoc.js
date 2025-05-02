import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import filieresConfig from './../pages/config/filieres';
import {
  Card, List, ListItem, ListItemText, Typography,
  Button, Chip, Snackbar, Alert, Box, Paper, IconButton, InputBase, Avatar, styled,
  MenuItem, FormControl, Select, Divider, InputLabel,
  CircularProgress, Collapse, Tooltip, Breadcrumbs, Link
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  Folder as FolderIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

const SearchField = styled(Paper)(({ theme }) => ({
  padding: '2px 12px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  }
}));

const DocumentCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  borderLeft: '4px solid transparent',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[4],
    borderLeft: `4px solid ${theme.palette.primary.main}`
  }
}));

const StudentDoc = () => {
  const [studentData, setStudentData] = useState({
    filiere: '',
    classe: '',
    niveau: '',
    semestre: 'S1'
  });
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [semesterExpanded, setSemesterExpanded] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const filieres = useMemo(() => filieresConfig, []);

  // Chargement des données étudiant
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const response = await axios.get(`${API_URL}/etudiant/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const { filiere, classe } = response.data;
        const niveau = classe.substring(0, 3);

        setStudentData({
          filiere,
          classe,
          niveau,
          semestre: 'S1'
        });

        localStorage.setItem('studentProfile', JSON.stringify({ filiere, classe }));

      } catch (error) {
        console.error("Erreur de chargement du profil:", error);
        const savedData = localStorage.getItem('studentProfile');
        if (savedData) {
          const { filiere, classe } = JSON.parse(savedData);
          const niveau = classe.substring(0, 3);
          setStudentData({
            filiere,
            classe,
            niveau,
            semestre: 'S1'
          });
        }
      }
    };

    fetchStudentData();
  }, []);

  // Chargement des matières - CORRIGÉ
  useEffect(() => {
    const loadMatieres = () => {
      const { filiere, classe, semestre } = studentData;
console.log(studentData.filiere)
      if (filiere && classe && semestre) {
        try {
          const filiereData = filieres[filiere];
          console.log('-----------', filiereData)
          if (filiereData?.classes?.[classe]?.semestres?.[semestre]) {
            const matieresForSemester = filiereData.classes[classe].semestres[semestre];
            setMatieres(matieresForSemester);
          } else {
            setMatieres([]);
          }
        } catch (error) {
          console.error('Erreur chargement matières:', error);
          setMatieres([]);
        }
      }
    };

    loadMatieres();
  }, [studentData, filieres]); // Correction: ajout de studentData comme dépendance

  // Chargement des documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const { filiere, classe } = studentData;
        const response = await axios.get(`${API_URL}/documents/${filiere}/${classe}`);
        setDocuments(response.data);
      } catch (error) {
        console.error("Erreur de chargement des documents:", error);
        showNotification("Erreur lors du chargement des documents", 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (studentData.filiere && studentData.classe) {
      fetchDocuments();
    }
  }, [studentData]);

  // Filtrage des documents
  useEffect(() => {
    let results = documents;

    if (selectedSubject) {
      results = results.filter(doc => doc.matiere === selectedSubject);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(doc =>
        doc.title.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.matiere.toLowerCase().includes(term)
      );
    }

    setFilteredDocs(results);
  }, [documents, selectedSubject, searchTerm]);

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const downloadFile = async (id, fileName) => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await axios.get(`${API_URL}/documents/${id}/download`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showNotification(`Téléchargement de "${fileName}" réussi`, 'success');
    } catch (error) {
      showNotification("Erreur lors du téléchargement", 'error');
      console.error("Erreur API:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📕',
      doc: '📘',
      docx: '📘',
      ppt: '📊',
      pptx: '📊',
      xls: '📈',
      xlsx: '📈',
      txt: '📄'
    };
    const fileType = type?.split('/')[1] || '';
    return icons[fileType] || '📁';
  };

  const handleSemesterChange = (semester) => {
    setStudentData(prev => ({ ...prev, semestre: semester }));
    setSelectedSubject('');
  };
  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 },
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: 'background.default',
      minHeight: '100vh'
    }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/etudiantProfil">
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Accueil
        </Link>
        <Typography color="text.primary">
          Documents
        </Typography>
      </Breadcrumbs>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          width: '100%'
        }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 60, 
            height: 60, 
            mr: 2,
            boxShadow: 2
          }}>
            <FolderIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Documents académiques
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label={studentData.filiere} 
                color="primary" 
                size="small" 
                sx={{ fontWeight: 600 }} 
              />
              <Chip 
                label={studentData.classe} 
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 500 }} 
              />
              <Chip 
                label={`Semestre ${studentData.semestre}`} 
                color="secondary" 
                size="small" 
                sx={{ fontWeight: 500 }} 
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <SearchField>
            <InputBase
              placeholder="Rechercher un document..."
              sx={{ ml: 1, flex: 1 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '10px' }}>
              <SearchIcon />
            </IconButton>
          </SearchField>

          <Tooltip title={emailSubscribed ? "Désactiver les notifications" : "Activer les notifications"}>
            <IconButton
              color={emailSubscribed ? "primary" : "default"}
              onClick={() => setEmailSubscribed(!emailSubscribed)}
              sx={{ ml: 1 }}
            >
              {emailSubscribed ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 3,
        mt: 2
      }}>
        <Box sx={{ 
          width: { xs: '100%', lg: '300px' },
          flexShrink: 0
        }}>
          <Paper elevation={0} sx={{ 
            p: 2, 
            borderRadius: '12px',
            backgroundColor: 'background.paper',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer'
            }} onClick={() => setSemesterExpanded(!semesterExpanded)}>
              <Typography variant="h6" sx={{ 
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary'
              }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                Filtres
              </Typography>
              {semesterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={semesterExpanded}>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Sélectionnez un semestre
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label="Semestre 1" 
                    onClick={() => handleSemesterChange('S1')}
                    color={studentData.semestre === 'S1' ? 'primary' : 'default'}
                    variant={studentData.semestre === 'S1' ? 'filled' : 'outlined'}
                  />
                  <Chip 
                    label="Semestre 2" 
                    onClick={() => handleSemesterChange('S2')}
                    color={studentData.semestre === 'S2' ? 'primary' : 'default'}
                    variant={studentData.semestre === 'S2' ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>

              <FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel>Matières {studentData.semestre}</InputLabel>
  <Select
    value={selectedSubject}
    onChange={(e) => setSelectedSubject(e.target.value)}
    label={`Matières - ${studentData.semestre}`}
    sx={{ borderRadius: '12px' }}
  >
    <MenuItem value="">
      <em>Toutes les matières</em>
    </MenuItem>
    {matieres.map((matiere) => (
      <MenuItem key={matiere} value={matiere}>
        {matiere}
      </MenuItem>
    ))}
  </Select>
  {matieres.length === 0 && (
    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
      Aucune matière disponible pour {studentData.filiere} - {studentData.classe} - {studentData.semestre}
    </Typography>
  )}
</FormControl>
            </Collapse>
          </Paper>
        </Box>

        <Box sx={{ 
          flex: 1,
          backgroundColor: 'background.paper',
          borderRadius: '12px',
          p: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center'
            }}>
              <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
              {selectedSubject 
                ? `Documents - ${selectedSubject}` 
                : `Tous les documents - Semestre ${studentData.semestre}`}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} trouvé{filteredDocs.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '300px'
            }}>
              <CircularProgress />
            </Box>
          ) : filteredDocs.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 6,
              p: 4,
              backgroundColor: 'action.hover',
              borderRadius: '12px'
            }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                {searchTerm || selectedSubject
                  ? "Aucun document trouvé"
                  : "Aucun document disponible pour ce semestre"}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {searchTerm || selectedSubject
                  ? "Modifiez vos critères de recherche"
                  : "Revenez plus tard pour voir les nouveaux documents"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  sx={{
                    mb: 2,
                    borderLeft: doc.isNew 
                      ? '4px solid #4CAF50'
                      : '4px solid transparent'
                  }}
                >
                  <ListItem sx={{ 
                    py: 2,
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}>
                    <Box sx={{ 
                      fontSize: '2rem', 
                      mr: 2,
                      mt: 1,
                      color: '#2196F3'
                    }}>
                      {getFileIcon(doc.file?.type)}
                    </Box>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{ 
                              fontWeight: 600,
                              color: 'text.primary'
                            }}
                          >
                            {doc.title}
                          </Typography>
                          {doc.isNew && (
                            <Chip 
                              label="Nouveau" 
                              color="success" 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                fontWeight: 500,
                                backgroundColor: '#4CAF5020'
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ 
                            mt: 0.5,
                            color: 'text.secondary'
                          }}>
                            {doc.description}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mt: 1.5,
                            flexWrap: 'wrap',
                            gap: 1
                          }}>
                            <Chip 
                              label={doc.matiere} 
                              size="small" 
                              variant="outlined" 
                              sx={{ 
                                fontWeight: 500,
                                backgroundColor: '#2196F320',
                                borderColor: '#2196F350'
                              }} 
                            />
                            <Chip 
                              label={studentData.semestre} 
                              size="small" 
                              sx={{ 
                                fontWeight: 500,
                                backgroundColor: 'action.hover'
                              }} 
                            />
                            <Typography variant="caption" sx={{ 
                              color: 'text.disabled',
                              ml: 'auto'
                            }}>
                              {formatDate(doc.createdAt)} • {(doc.file?.size / 1024).toFixed(1)} KB
                            </Typography>
                          </Box>
                        </>
                      }
                      sx={{ flex: 1 }}
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => downloadFile(doc._id, doc.title)}
                      startIcon={<DownloadIcon />}
                      sx={{
                        minWidth: '160px',
                        borderRadius: '8px',
                        boxShadow: 'none',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        '&:hover': {
                          boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      Télécharger
                    </Button>
                  </ListItem>
                </DocumentCard>
              ))}
            </List>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            boxShadow: 3,
            borderRadius: '8px',
            alignItems: 'center'
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    
  );
    }
export default StudentDoc;