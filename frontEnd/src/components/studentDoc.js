import React, { useState, useEffect } from 'react';
import {
  Card, List, ListItem, ListItemText, Typography,
  Button, Chip, Snackbar, Alert, Box, Avatar, Tabs,
  Tab, Paper, styled, InputBase, IconButton,Badge
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 0,
  marginRight: theme.spacing(2),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 'bold'
  }
}));

const SearchField = styled(Paper)(({ theme }) => ({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: 300,
  borderRadius: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
}));

const StudentDoc = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [newDocsCount, setNewDocsCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [tabValue, setTabValue] = useState('S1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const subjectsBySemester = {
    S1: ['Algorithmique', 'Base de données'],
    S2: ['Web', 'Réseaux']
  };

  const studentData = {
    filiere: 'Informatique',
    classe: 'L2'
  };

  useEffect(() => {
    const savedDocs = JSON.parse(localStorage.getItem('teacherDocuments') || '[]');
    const relevantDocs = savedDocs.filter(doc =>
      doc.filiere === studentData.filiere &&
      doc.classe === studentData.classe
    );

    setDocuments(relevantDocs);
    setFilteredDocs(relevantDocs);

    const lastView = localStorage.getItem('lastDocumentView') || 0;
    const newDocs = relevantDocs.filter(doc =>
      new Date(doc.createdAt) > new Date(lastView)
    ).length;

    setNewDocsCount(newDocs);
    if (newDocs > 0) {
      showNotification('${newDocs} nouveau(x) document(s) disponible(s)!', 'info');
    }

    localStorage.setItem('lastDocumentView', new Date().toISOString());
  }, []);

  useEffect(() => {
    let results = documents.filter(doc => doc.semester === tabValue);

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
  }, [documents, tabValue, selectedSubject, searchTerm]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedSubject('');
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const markAsViewed = () => {
    setNewDocsCount(0);
    localStorage.setItem('lastDocumentView', new Date().toISOString());
  };

  const downloadFile = (file, title) => {
    const link = document.createElement('a');
    link.href = 'data:${file.type};base64,${file.content}';
    link.download = file.name;
    link.click();
    showNotification('"${title}" téléchargé avec succès', 'success');
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
    return icons[type] || '📁';
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mr: 2 }}>
            <DescriptionIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Mes Documents
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Chip label={studentData.filiere} color="primary" size="small" sx={{ mr: 1 }} />
              <Chip label={studentData.classe} variant="outlined" size="small" />
            </Box>
          </Box>
        </Box>

        <Badge badgeContent={newDocsCount} color="error" onClick={markAsViewed} sx={{ cursor: 'pointer' }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <NotificationsIcon />
          </Avatar>
        </Badge>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            orientation="vertical"
          >
            <StyledTab label="Semestre 1" value="S1" />
            <StyledTab label="Semestre 2" value="S2" />
          </Tabs>

          <Box mt={2} ml={1}>
            {subjectsBySemester[tabValue].map(subject => (
              <Button
                key={subject}
                variant={subject === selectedSubject ? 'contained' : 'outlined'}
                color="primary"
                fullWidth
                sx={{ mb: 1, textTransform: 'none', justifyContent: 'flex-start' }}
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </Button>
            ))}
          </Box>
        </Box>

        <Box flex={1} ml={4}>
          <SearchField sx={{ mb: 3 }}>
            <InputBase
              placeholder="Rechercher un document..."
              sx={{ ml: 2, flex: 1 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
          </SearchField>

          {filteredDocs.length === 0 ? (
            <Box textAlign="center" mt={6}>
              <Typography variant="h6" color="textSecondary">
                {searchTerm
                  ? "Aucun document ne correspond à votre recherche"
                  : "Aucun document disponible pour le moment"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {searchTerm
                  ? "Essayez avec d'autres termes"
                  : "Vos enseignants partageront bientôt du contenu"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {filteredDocs.map((doc) => (
                <Card
                  key={doc.id}
                  sx={{
                    mb: 2,
                    transition: 'all 0.3s',
                    borderLeft: '4px solid',
                    borderColor: new Date(doc.createdAt) > new Date(localStorage.getItem('lastDocumentView'))
                      ? 'secondary.main'
                      : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <ListItem sx={{ py: 2 }}>
                    <Box sx={{ fontSize: '2rem', mr: 2 }}>
                      {getFileIcon(doc.file.type.split('/')[1])}
                    </Box>

                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {doc.title}
                          </Typography>
                          {new Date(doc.createdAt) > new Date(localStorage.getItem('lastDocumentView')) && (
                            <Chip label="Nouveau" color="secondary" size="small" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {doc.description}
                          </Typography>
                          <Box display="flex" sx={{ mt: 1 }}>
                            <Chip label={doc.subject} size="small" variant="outlined" sx={{ mr: 1 }} />
                            <Typography variant="caption" color="textSecondary">
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
                      sx={{
                        minWidth: '140px',
                        borderRadius: '20px',
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      Télécharger
                    </Button>
                  </ListItem>
                </Card>
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
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentDoc;