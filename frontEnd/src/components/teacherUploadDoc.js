import React, { useState, useEffect } from 'react';
import {
  Button, Card, List, ListItem, ListItemText, TextField, Typography,
  Select, MenuItem, FormControl, InputLabel, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { Upload as UploadIcon, Description as DescriptionIcon, Edit, Delete } from '@mui/icons-material';

const TeacherDocuments = () => {
  // États pour les documents et le formulaire
  const [documents, setDocuments] = useState([]);
  const [newDoc, setNewDoc] = useState({
    title: '',
    description: '',
    filiere: '',
    classe: '',
    file: null
  });
  const [editingDoc, setEditingDoc] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Options pour filières et classes
  const filieres = ['Informatique', 'Mathématiques', 'Physique', 'Chimie'];
  const classes = ['L1', 'L2', 'L3', 'M1', 'M2'];

  // Charger les documents depuis le localStorage
  useEffect(() => {
    const savedDocs = localStorage.getItem('teacherDocuments');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedDoc = editingDoc ? { ...editingDoc } : { ...newDoc };
        updatedDoc.file = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result.split(',')[1]
        };
        editingDoc ? setEditingDoc(updatedDoc) : setNewDoc(updatedDoc);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!newDoc.title || !newDoc.file || !newDoc.filiere || !newDoc.classe) {
      showSnackbar('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const updatedDocs = [
      {
        id: Date.now(),
        ...newDoc,
        createdAt: new Date().toISOString()
      },
      ...documents
    ];

    saveDocuments(updatedDocs);
    resetForm();
    showSnackbar('Document publié avec succès', 'success');
  };

  const handleUpdate = () => {
    if (!editingDoc.title || !editingDoc.file || !editingDoc.filiere || !editingDoc.classe) {
      showSnackbar('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const updatedDocs = documents.map(doc => 
      doc.id === editingDoc.id ? editingDoc : doc
    );

    saveDocuments(updatedDocs);
    setEditingDoc(null);
    setOpenDialog(false);
    showSnackbar('Document modifié avec succès', 'success');
  };

  const handleDelete = (id) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    saveDocuments(updatedDocs);
    showSnackbar('Document supprimé avec succès', 'success');
  };

  const saveDocuments = (docs) => {
    setDocuments(docs);
    localStorage.setItem('teacherDocuments', JSON.stringify(docs));
  };

  const resetForm = () => {
    setNewDoc({
      title: '',
      description: '',
      filiere: '',
      classe: '',
      file: null
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = 'data:${file.type};base64,${file.content}';
    link.download = file.name;
    link.click();
  };

  const openEditDialog = (doc) => {
    setEditingDoc({ ...doc });
    setOpenDialog(true);
  };

  return (
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
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={newDoc.description}
            onChange={(e) => setNewDoc({...newDoc, description: e.target.value})}
          />
          
          <FormControl fullWidth>
            <InputLabel>Filière*</InputLabel>
            <Select
              value={newDoc.filiere}
              label="Filière*"
              onChange={(e) => setNewDoc({...newDoc, filiere: e.target.value})}
            >
              {filieres.map(filiere => (
                <MenuItem key={filiere} value={filiere}>{filiere}</MenuItem>
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
          disabled={!newDoc.title || !newDoc.file || !newDoc.filiere || !newDoc.classe}
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
                        {doc.filiere} - {doc.classe}
                      </span>
                    </div>
                  }
                  secondary={
                    <>
                      <Typography component="div" variant="body2" color="textSecondary">
                        {doc.description}
                      </Typography>
                      <Typography component="div" variant="caption" color="textSecondary">
                        Publié le: {new Date(doc.createdAt).toLocaleDateString()} | 
                        Taille: {(doc.file.size / 1024).toFixed(2)} KB | 
                        Type: {doc.file.type.split('/')[1].toUpperCase()}
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
                    onClick={() => downloadFile(doc.file)}
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
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={editingDoc?.description || ''}
              onChange={(e) => setEditingDoc({...editingDoc, description: e.target.value})}
            />
            
            <FormControl fullWidth>
              <InputLabel>Filière*</InputLabel>
              <Select
                value={editingDoc?.filiere || ''}
                label="Filière*"
                onChange={(e) => setEditingDoc({...editingDoc, filiere: e.target.value})}
              >
                {filieres.map(filiere => (
                  <MenuItem key={filiere} value={filiere}>{filiere}</MenuItem>
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
          
          {editingDoc?.file && (
            <Typography variant="body2" component="span">
              Fichier actuel: {editingDoc.file.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleUpdate}
            disabled={!editingDoc?.title || !editingDoc?.file || !editingDoc?.filiere || !editingDoc?.classe}
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
  );
};

export default TeacherDocuments;