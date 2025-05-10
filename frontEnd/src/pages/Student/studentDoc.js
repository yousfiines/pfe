import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Chip, List, ListItem,
  ListItemText, IconButton, InputBase, Avatar, Divider,
  CircularProgress, Grid, Fade, Grow, Slide, styled
} from '@mui/material';
import {
  ChevronLeft, Description, Download, MenuBook,
  CalendarMonth, FilterAlt, Search
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: '18px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
  }
}));

const SubjectButton = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: '14px',
  marginBottom: '8px',
  padding: '8px 16px',
  background: selected ? 
    'linear-gradient(90deg, rgba(101,87,255,0.1) 0%, rgba(101,87,255,0.05) 100%)' : 
    'transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(101,87,255,0.05)'
  }
}));

const GradientButton = styled(Button)({
  background: 'linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '12px',
  padding: '10px 24px',
  boxShadow: '0 4px 15px rgba(101,87,255,0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #5949FF 0%, #7B6AFF 100%)',
    boxShadow: '0 6px 20px rgba(101,87,255,0.4)'
  }
});

const StudentDoc = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentInfo, setStudentInfo] = useState({
    filiere: '',
    classe: '',
    semestres: {},
    filiereId: '',
    classeId: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const studentCin = localStorage.getItem('studentCin');

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

// Obtenir les semestres disponibles de manière sécurisée
  const availableSemesters = Object.keys(studentInfo.semestres || {});

const subjectsForSemester = selectedSemester 
    ? studentInfo.semestres[selectedSemester] || []
    : [];

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Récupérer les données de l'étudiant avec les noms complets
        const response = await axios.get(`http://localhost:5000/api/etudiant/${studentCin}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          const studentData = response.data.data;
          
          // 2. Récupérer les matières par filière/classe
          const matieresResponse = await axios.get('http://localhost:5000/api/cours-etudiant', {
            params: {
              filiere: studentData.filiere_id,
              classe: studentData.classe_id
            },
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (matieresResponse.data.success) {
            // Organiser les matières par semestre
            const semestresData = {};
            matieresResponse.data.data.forEach(semestre => {
              semestresData[semestre.semestre] = semestre.matieres.map(m => m.nom);
            });

            setStudentInfo({
              filiere: studentData.Filière,
              classe: studentData.Classe,
              filiereId: studentData.filiere_id,
              classeId: studentData.classe_id,
              semestres: semestresData
            });

            // Sélectionner le premier semestre disponible
            const semesters = Object.keys(semestresData);
            if (semesters.length > 0 && !selectedSemester) {
              setSelectedSemester(semesters[0]);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && studentCin) {
      fetchStudentData();
    }
  }, [token, studentCin]);

  const loadDocumentsForSubject = async (matiereNom) => {
    try {
      // 1. Trouver l'ID de la matière
      const [matieres] = await axios.get('http://localhost:5000/api/matieres', {
        params: { search: matiereNom },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (matieres.data.length > 0) {
        const matiereId = matieres.data[0].id;
        
        // 2. Charger les documents associés
        const docsResponse = await axios.get('http://localhost:5000/api/documents-matiere', {
          params: { matiereId },
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (docsResponse.data.success) {
          setDocuments(docsResponse.data.documents.map(doc => ({
            ...doc,
            matiere: matiereNom,
            size: doc.size_kb * 1024 // Convertir en bytes
          })));
        }
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error);
    }
  };

  const handleSubjectSelect = (matiere) => {
    setSelectedSubject(matiere);
    loadDocumentsForSubject(matiere);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/download-document/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `document-${documentId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSubject = !selectedSubject || doc.matiere === selectedSubject;
    const matchesSemester = !selectedSemester || doc.semestre === selectedSemester;
    const matchesSearch = searchQuery 
      ? (doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesSubject && matchesSemester && matchesSearch;
  });

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f9ff 0%, #f0f2ff 100%)'
    }}>
      {/* Sidebar - Version desktop */}
      <Paper sx={{
        display: { xs: 'none', md: 'block' },
        width: 320,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRadius: 0,
        borderRight: '1px solid rgba(0,0,0,0.05)',
        p: 4,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            color: 'white'
          }}>
            <MenuBook fontSize="small" />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{
            background: 'linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mes Cours
          </Typography>
        </Box>

        <Divider sx={{
          mb: 4,
          borderColor: 'rgba(0,0,0,0.05)'
        }} />


        {/* Sélecteur de semestre */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{
            mb: 2,
            color: 'text.secondary',
            fontWeight: 'medium',
            letterSpacing: '0.5px',
            fontSize: '0.75rem'
          }}>
            SEMESTRES
          </Typography>
          {Object.keys(studentInfo.semestres).length > 0 ? (
            <Box sx={{
              display: 'flex',
              gap: 1,
              background: 'rgba(101,87,255,0.05)',
              p: 1,
              borderRadius: '14px'
            }}>
              {Object.keys(studentInfo.semestres).map(sem => (
                <Button
                  key={sem}
                  fullWidth
                  onClick={() => setSelectedSemester(sem)}
                  sx={{
                    borderRadius: '10px',
                    py: 1.5,
                    fontWeight: 'medium',
                    fontSize: '0.875rem',
                    background: selectedSemester === sem ?
                      'linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)' : 'transparent',
                    color: selectedSemester === sem ? '#fff' : 'text.primary',
                    boxShadow: selectedSemester === sem ? '0 4px 12px rgba(101,87,255,0.3)' : 'none',
                    '&:hover': {
                      background: selectedSemester === sem ?
                        'linear-gradient(45deg, #5949FF 0%, #7B6AFF 100%)' : 'rgba(101,87,255,0.08)'
                    }
                  }}
                >
                  Semestre {sem}
                </Button>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucun semestre disponible
            </Typography>
          )}
        </Box>

        {/* Liste des matières */}
        {selectedSemester && (
          <>
            <Typography variant="subtitle2" sx={{
              mb: 2,
              color: 'text.secondary',
              fontWeight: 'medium',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}>
              MATIÈRES ({selectedSemester})
            </Typography>
            <List dense sx={{ maxHeight: '55vh', overflowY: 'auto', pr: 1 }}>
              <SubjectButton
                selected={!selectedSubject}
                onClick={() => {
                  setSelectedSubject(null);
                  setDocuments([]);
                }}
                sx={{ mb: 1 }}
              >
                <ListItemText
                  primary="Toutes les matières"
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    fontSize: '0.9rem'
                  }}
                />
              </SubjectButton>

              {studentInfo.semestres[selectedSemester]?.map((matiere) => (
                <motion.div
                  key={matiere}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SubjectButton
                    selected={selectedSubject === matiere}
                    onClick={() => handleSubjectSelect(matiere)}
                  >
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      mr: 2,
                      bgcolor: selectedSubject === matiere ? '#6557FF' : 'rgba(101,87,255,0.1)',
                      color: selectedSubject === matiere ? '#fff' : '#6557FF',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {matiere.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={matiere}
                      primaryTypographyProps={{
                        fontWeight: selectedSubject === matiere ? 'bold' : 'medium',
                        fontSize: '0.9rem'
                      }}
                    />
                    {selectedSubject === matiere && (
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#6557FF',
                        ml: 1
                      }} />
                    )}
                  </SubjectButton>
                </motion.div>
              ))}
            </List>
          </>
        )}
      </Paper>

      {/* Main content */}
      <Box sx={{
        flexGrow: 1,
        p: { xs: 3, md: 5 },
        maxWidth: { md: 'calc(100% - 320px)' }
      }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                mr: 2,
                background: 'rgba(101,87,255,0.1)',
                color: '#6557FF',
                '&:hover': {
                  background: 'rgba(101,87,255,0.2)'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>

            <Box>
              <Typography variant="body2" sx={{
                color: '#6557FF',
                fontWeight: 'bold',
                mb: 0.5
              }}>
                {studentInfo.filiere || 'Filière non spécifiée'}
              </Typography>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {studentInfo.classe || 'Classe non spécifiée'}
              </Typography>
            </Box>
          </Box>

          {selectedSemester && (
            <Chip
              icon={<CalendarMonth fontSize="small" sx={{ color: '#6557FF' }} />}
              label={`Semestre ${selectedSemester}`}
              sx={{
                fontWeight: 'bold',
                background: 'rgba(101,87,255,0.1)',
                color: '#6557FF'
              }}
            />
          )}
        </Box>

        {/* Search and filter */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 5,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Paper
            component="form"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <IconButton sx={{ p: '10px', color: 'text.secondary' }} aria-label="search">
              <Search />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>

          <Button
            variant="outlined"
            startIcon={<FilterAlt />}
            onClick={handleDrawerToggle}
            sx={{
              borderRadius: '14px',
              fontWeight: 'bold',
              minWidth: '120px',
              color: '#6557FF',
              borderColor: 'rgba(101,87,255,0.3)',
              '&:hover': {
                borderColor: '#6557FF',
                background: 'rgba(101,87,255,0.05)'
              }
            }}
          >
            Filtres
          </Button>
        </Box>

        {/* Content title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{
            fontWeight: 'bold',
            mb: 1
          }}>
            {selectedSubject || 'Tous les documents'}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Box component="span" sx={{
              width: 6,
              height: 6,
              background: '#6557FF',
              borderRadius: '50%',
              mr: 1
            }} />
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} disponible{filteredDocuments.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Documents grid */}
        {filteredDocuments.length === 0 ? (
          <Grow in={true}>
            <GlassPaper sx={{
              p: 5,
              textAlign: 'center'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                background: 'rgba(101,87,255,0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                mx: 'auto'
              }}>
                <Description sx={{ fontSize: 40, color: '#6557FF' }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Aucun document trouvé
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                {selectedSubject
                  ? `Aucun document disponible pour "${selectedSubject}" ce semestre`
                  : 'Aucun document disponible pour cette sélection'}
              </Typography>
            </GlassPaper>
          </Grow>
        ) : (
          <Grid container spacing={3}>
            {filteredDocuments.map((doc, index) => (
              <Grid item xs={12} sm={6} lg={4} key={doc.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassPaper>
                    <Box sx={{
                      p: 3,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Avatar sx={{
                          bgcolor: 'rgba(101,87,255,0.1)',
                          color: '#6557FF',
                          mr: 2,
                          width: 48,
                          height: 48,
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}>
                          {doc.matiere.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {doc.matiere}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {new Date(doc.date).toLocaleDateString()} • {formatFileSize(doc.size)}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="h6" sx={{
                        mb: 1,
                        fontWeight: 'bold',
                        lineHeight: 1.3
                      }}>
                        {doc.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        mb: 2,
                        fontSize: '0.85rem'
                      }}>
                        {doc.description}
                      </Typography>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Chip
                          label={doc.type.toUpperCase()}
                          size="small"
                          sx={{
                            background: 'rgba(101,87,255,0.1)',
                            color: '#6557FF',
                            fontWeight: 'bold',
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                        {!doc.viewed && (
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#FF5252',
                            ml: 1
                          }} />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}>
                      <GradientButton
                        startIcon={<Download />}
                        size="small"
                        onClick={() => handleDownload(doc.id, doc.nom_fichier)}
                      >
                        Télécharger
                      </GradientButton>
                    </Box>
                  </GlassPaper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Mobile sidebar */}
      <Slide direction="right" in={mobileOpen} mountOnEnter unmountOnExit>
        <Paper sx={{
          width: 280,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1200,
          p: 3,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)'
        }}>
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{
              mb: 2,
              color: 'text.secondary',
              fontWeight: 'medium',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}>
              SEMESTRES
            </Typography>
            {availableSemesters.length > 0 ? (
              <Box sx={{
                display: 'flex',
                gap: 1,
                background: 'rgba(101,87,255,0.05)',
                p: 1,
                borderRadius: '14px'
              }}>
                {availableSemesters.map(sem => (
                  <Button
                    key={sem}
                    fullWidth
                    onClick={() => {
                      setSelectedSemester(sem);
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: '10px',
                      py: 1.5,
                      fontWeight: 'medium',
                      fontSize: '0.875rem',
                      background: selectedSemester === sem ?
                        'linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)' : 'transparent',
                      color: selectedSemester === sem ? '#fff' : 'text.primary',
                      boxShadow: selectedSemester === sem ? '0 4px 12px rgba(101,87,255,0.3)' : 'none',
                      '&:hover': {
                        background: selectedSemester === sem ?
                          'linear-gradient(45deg, #5949FF 0%, #7B6AFF 100%)' : 'rgba(101,87,255,0.08)'
                      }
                    }}
                  >
                    Semestre {sem}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucun semestre disponible
              </Typography>
            )}
          </Box>

          {selectedSemester && (
            <>
              <Typography variant="subtitle2" sx={{
                mb: 2,
                color: 'text.secondary',
                fontWeight: 'medium',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}>
                MATIÈRES ({selectedSemester})
              </Typography>
              <List dense sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
                <SubjectButton
                  selected={!selectedSubject}
                  onClick={() => {
                    setSelectedSubject(null);
                    setMobileOpen(false);
                  }}
                  sx={{ mb: 1 }}
                >
                  <ListItemText
                    primary="Toutes les matières"
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                      fontSize: '0.9rem'
                    }}
                  />
                </SubjectButton>

                {subjectsForSemester.map((matiere) => (
                  <motion.div
                    key={matiere}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SubjectButton
                      selected={selectedSubject === matiere}
                      onClick={() => {
                        setSelectedSubject(matiere);
                        setMobileOpen(false);
                      }}
                    >
                      <Avatar sx={{
                        width: 32,
                        height: 32,
                        mr: 2,
                        bgcolor: selectedSubject === matiere ? '#6557FF' : 'rgba(101,87,255,0.1)',
                        color: selectedSubject === matiere ? '#fff' : '#6557FF',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {matiere.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={matiere}
                        primaryTypographyProps={{
                          fontWeight: selectedSubject === matiere ? 'bold' : 'medium',
                          fontSize: '0.9rem'
                        }}
                      />
                      {selectedSubject === matiere && (
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#6557FF',
                          ml: 1
                        }} />
                      )}
                    </SubjectButton>
                  </motion.div>
                ))}
              </List>
            </>
          )}
        </Paper>
      </Slide>
    </Box>
  );
};

export default StudentDoc;