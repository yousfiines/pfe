import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

// Styles personnalisés
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
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedSemester, setSelectedSemester] = useState('S1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [semesterExpanded, setSemesterExpanded] = useState(true);

  // Matières des semestres
  const semesterSubjects = {
    S1: [
      { name: 'Algorithmique', icon: '🧮', color: '#4CAF50' },
      { name: 'Base de données', icon: '🗃', color: '#2196F3' },
      { name: 'Mathématiques', icon: '∫', color: '#9C27B0' },
      { name: 'Programmation', icon: '💻', color: '#FF9800' }
    ],
    S2: [
      { name: 'Réseaux', icon: '🌐', color: '#3F51B5' },
      { name: 'Systèmes', icon: '💾', color: '#607D8B' },
      { name: 'Web', icon: '🕸', color: '#E91E63' },
      { name: 'IA', icon: '🧠', color: '#795548' }
    ]
  };

  const studentData = {
    filiere: 'Informatique',
    classe: 'L2'
  };

  // Charger les documents depuis l'API
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/documents');
        
        const formattedDocs = response.data.map(doc => ({
          ...doc,
          file: {
            name: doc.fileName,
            type: doc.fileType,
            size: doc.fileSize,
            content: ''
          },
          createdAt: doc.createdAt || new Date().toISOString(),
          isNew: !localStorage.getItem('lastDocumentView') || 
                 new Date(doc.createdAt) > new Date(localStorage.getItem('lastDocumentView'))
        }));

        setDocuments(formattedDocs);
        setFilteredDocs(formattedDocs);

      } catch (error) {
        showNotification('Erreur de chargement des documents', 'error');
        console.error("Erreur API:", error);
        
        const mockDocuments = getMockDocuments();
        setDocuments(mockDocuments);
        setFilteredDocs(mockDocuments);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Données mockées pour le fallback
  const getMockDocuments = () => {
    return [
      {
        id: 1,
        title: 'Cours Algorithmique S1',
        description: 'Introduction aux algorithmes et structures de données',
        subject: 'Algorithmique',
        semester: 'S1',
        file: {
          name: 'cours_algorithmique.pdf',
          type: 'application/pdf',
          size: 2456,
          content: ''
        },
        createdAt: '2023-10-15T09:30:00Z',
        isNew: true
      },
      {
        id: 2,
        title: 'TP Base de Données',
        description: 'Travaux pratiques sur les requêtes SQL',
        subject: 'Base de données',
        semester: 'S1',
        file: {
          name: 'tp_bdd.docx',
          type: 'application/docx',
          size: 1852,
          content: ''
        },
        createdAt: '2023-10-18T14:15:00Z',
        isNew: false
      },
      {
        id: 3,
        title: 'Cours Réseaux S2',
        description: 'Introduction aux protocoles réseau',
        subject: 'Réseaux',
        semester: 'S2',
        file: {
          name: 'cours_reseaux.pdf',
          type: 'application/pdf',
          size: 3200,
          content: ''
        },
        createdAt: '2023-11-05T10:20:00Z',
        isNew: true
      }
    ];
  };

  // Filtrer les documents
  useEffect(() => {
    let results = documents.filter(doc => doc.semester === selectedSemester);

    if (selectedSubject) {
      results = results.filter(doc => doc.subject === selectedSubject);
    }

    if (searchTerm) {
      results = results.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocs(results);
  }, [documents, selectedSemester, selectedSubject, searchTerm]);

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const downloadFile = (file, title) => {
    showNotification(`Téléchargement de "${title}" commencé`, 'success');
    // Ici vous pourriez ajouter un appel API pour le téléchargement réel
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
    setSelectedSemester(semester);
    setSelectedSubject(''); // Réinitialiser la matière sélectionnée
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 },
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: 'background.default',
      minHeight: '100vh'
    }}>
      {/* Fil d'Ariane */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/">
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Accueil
        </Link>
        <Typography color="text.primary">
          Documents
        </Typography>
      </Breadcrumbs>

      {/* En-tête */}
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
                label={`Semestre ${selectedSemester}`} 
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

      {/* Contenu principal */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 3,
        mt: 2
      }}>
        {/* Panneau latéral - Filtres */}
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
                    color={selectedSemester === 'S1' ? 'primary' : 'default'}
                    variant={selectedSemester === 'S1' ? 'filled' : 'outlined'}
                  />
                  <Chip 
                    label="Semestre 2" 
                    onClick={() => handleSemesterChange('S2')}
                    color={selectedSemester === 'S2' ? 'primary' : 'default'}
                    variant={selectedSemester === 'S2' ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Matières {selectedSemester}</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  label={`Matières - ${selectedSemester}`}
                  sx={{ borderRadius: '12px' }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '12px',
                        marginTop: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                      }
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="textSecondary">Toutes les matières</Typography>;
                    }
                    const subject = semesterSubjects[selectedSemester].find(sub => sub.name === selected);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          marginRight: '8px', 
                          fontSize: '1.2rem',
                          color: subject?.color
                        }}>
                          {subject?.icon}
                        </span>
                        {selected}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="">
                    <em>Toutes les matières</em>
                  </MenuItem>
                  {semesterSubjects[selectedSemester].map((subject) => (
                    <MenuItem 
                      key={subject.name} 
                      value={subject.name}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          marginRight: '12px', 
                          fontSize: '1.2rem',
                          color: subject.color
                        }}>
                          {subject.icon}
                        </span>
                        {subject.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Collapse>
          </Paper>
        </Box>

        {/* Liste des documents */}
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
                : `Tous les documents - Semestre ${selectedSemester}`}
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
                      color: semesterSubjects[doc.semester]?.find(s => s.name === doc.subject)?.color
                    }}>
                      {getFileIcon(doc.file.type)}
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
                              label={doc.subject} 
                              size="small" 
                              variant="outlined" 
                              sx={{ 
                                fontWeight: 500,
                                backgroundColor: semesterSubjects[doc.semester]?.find(s => s.name === doc.subject)?.color + '20',
                                borderColor: semesterSubjects[doc.semester]?.find(s => s.name === doc.subject)?.color + '50'
                              }} 
                            />
                            <Chip 
                              label={doc.semester} 
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
                              {formatDate(doc.createdAt)} • {(doc.file.size / 1024).toFixed(1)} KB
                            </Typography>
                          </Box>
                        </>
                      }
                      sx={{ flex: 1 }}
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => downloadFile(doc.file, doc.title)}
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

      {/* Notification */}
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
};

export default StudentDoc;