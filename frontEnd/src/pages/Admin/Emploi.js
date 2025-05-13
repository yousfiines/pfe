import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Publish as PublishIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import AdminLayout from "./AdminLayout";

const Emploi = () => {
  const [emplois, setEmplois] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEmploi, setCurrentEmploi] = useState(null);
  const [filters, setFilters] = useState({
    filiere: "",
    classe: "",
    semestre: "",
    type: "",
  });
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [formData, setFormData] = useState({
    filiere_id: "",
    classe_id: "",
    semestre_id: "",
    type: "etudiant",
    fichier: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";



  
  // Récupérer les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [emploisRes, filieresRes, classesRes, semestresRes] =
          await Promise.all([
            axios.get(`${API_URL}/emplois`),
            axios.get(`${API_URL}/filieres`),
            axios.get(`${API_URL}/classes`),
            axios.get(`${API_URL}/semestres`),
          ]);

        setEmplois(emploisRes.data.data);
        setFilieres(filieresRes.data.data);
        setClasses(classesRes.data.data);
        setSemestres(semestresRes.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

 
  const handlePublish = async (id) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/emplois/${id}/publish`);
      
      if (response.data.success) {
        setEmplois(emplois.map(emploi => 
          emploi.id === id ? { ...emploi, published: true } : emploi
        ));
        setSuccess("Emploi du temps publié avec succès");
        
        // Recharger les données après publication
        const updated = await axios.get(`${API_URL}/emplois`);
        setEmplois(updated.data.data);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.response?.data?.message || "Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/emplois/${id}`);
      setEmplois(emplois.filter((emploi) => emploi.id !== id));
      setSuccess("Emploi du temps supprimé avec succès");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la suppression");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, fichier: e.target.files[0] });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Réinitialiser les dépendances si la filière change
    if (name === "filiere_id") {
      setFormData((prev) => ({
        ...prev,
        classe_id: "",
        semestre_id: "",
      }));
    }

    // Réinitialiser semestre si la classe change
    if (name === "classe_id") {
      setFormData((prev) => ({
        ...prev,
        semestre_id: "",
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("filiere_id", formData.filiere_id);
      data.append("classe_id", formData.classe_id);
      data.append("semestre_id", formData.semestre_id);
      data.append("type", formData.type);
      data.append("fichier", formData.fichier);

      let response;
      if (currentEmploi) {
        response = await axios.put(
          `${API_URL}/emplois/${currentEmploi.id}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(`${API_URL}/emplois`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Mettre à jour la liste des emplois
      const updatedEmplois = await axios.get(`${API_URL}/emplois`);
      setEmplois(updatedEmplois.data.data);

      setOpenDialog(false);
      resetFormData();
      setSuccess(
        currentEmploi
          ? "Emploi du temps mis à jour avec succès"
          : "Emploi du temps ajouté avec succès"
      );
    } catch (err) {
      console.error("Erreur:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement de l'emploi du temps"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      filiere_id: "",
      classe_id: "",
      semestre_id: "",
      type: "etudiant",
      fichier: null,
    });
    setCurrentEmploi(null);
  };

  const getClassesByFiliere = (filiereId) => {
    if (!filiereId) return [];
    return classes.filter((classe) => classe.filiere_id == filiereId);
  };

  const getSemestresByClasse = (classeId) => {
    if (!classeId) return [];
    return semestres.filter((semestre) => semestre.classe_id == classeId);
  };

  const getFiliereName = (id) => {
    const filiere = filieres.find((f) => f.id == id);
    return filiere ? filiere.nom : "-";
  };

  const getClasseName = (id) => {
    const classe = classes.find((c) => c.id == id);
    return classe ? classe.nom : "-";
  };

  const getSemestreInfo = (id) => {
    const semestre = semestres.find((s) => s.id == id);
    return semestre ? `S${semestre.numero}` : "-";
  };

  const getTypeName = (type) => {
    return type === "etudiant" ? "Étudiants" : "Enseignants";
  };

  const filteredEmplois = emplois.filter((emploi) => {
    return (
      (filters.filiere === "" || emploi.filiere_id == filters.filiere) &&
      (filters.classe === "" || emploi.classe_id == filters.classe) &&
      (filters.semestre === "" || emploi.semestre_id == filters.semestre) &&
      (filters.type === "" || emploi.type == filters.type)
    );
  });

  const handleDownload = (id) => {
    window.open(`${API_URL}/emplois/${id}/download`, "_blank");
  };

  const handleEdit = (emploi) => {
    setCurrentEmploi(emploi);
    setFormData({
      filiere_id: emploi.filiere_id,
      classe_id: emploi.classe_id,
      semestre_id: emploi.semestre_id,
      type: emploi.type,
      fichier: null,
    });
    setOpenDialog(true);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des emplois du temps
        </Typography>

        {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}

        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              label="Type"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="etudiant">Étudiants</MenuItem>
              <MenuItem value="enseignant">Enseignants</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Filière</InputLabel>
            <Select
              name="filiere"
              value={filters.filiere}
              onChange={handleFilterChange}
              label="Filière"
            >
              <MenuItem value="">Toutes</MenuItem>
              {filieres.map((filiere) => (
                <MenuItem key={filiere.id} value={filiere.id}>
                  {filiere.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Classe</InputLabel>
            <Select
              name="classe"
              value={filters.classe}
              onChange={handleFilterChange}
              label="Classe"
            >
              <MenuItem value="">Toutes</MenuItem>
              {classes.map((classe) => (
                <MenuItem key={classe.id} value={classe.id}>
                  {classe.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Semestre</InputLabel>
            <Select
              name="semestre"
              value={filters.semestre}
              onChange={handleFilterChange}
              label="Semestre"
            >
              <MenuItem value="">Tous</MenuItem>
              {semestres.map((semestre) => (
                <MenuItem key={semestre.id} value={semestre.id}>
                  S{semestre.numero} - {getClasseName(semestre.classe_id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setCurrentEmploi(null);
              setOpenDialog(true);
            }}
            sx={{ ml: "auto" }}
          >
            Nouvel emploi du temps
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Filière</TableCell>
                <TableCell>Classe</TableCell>
                <TableCell>Semestre</TableCell>
                <TableCell>Date création</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmplois.map((emploi) => (
                <TableRow key={emploi.id}>
                  <TableCell>{getTypeName(emploi.type)}</TableCell>
                  <TableCell>{getFiliereName(emploi.filiere_id)}</TableCell>
                  <TableCell>{getClasseName(emploi.classe_id)}</TableCell>
                  <TableCell>{getSemestreInfo(emploi.semestre_id)}</TableCell>
                  <TableCell>
                    {new Date(emploi.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {emploi.published ? (
                      <span style={{ color: "green" }}>Publié</span>
                    ) : (
                      <span style={{ color: "orange" }}>Brouillon</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(emploi.id)}
                    >
                      Télécharger
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PublishIcon />}
                      onClick={() => handlePublish(emploi.id)}
                      disabled={emploi.published}
                    >
                      Publier
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(emploi.id)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            resetFormData();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {currentEmploi
              ? "Modifier emploi du temps"
              : "Nouvel emploi du temps"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Type d'emploi</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  label="Type d'emploi"
                >
                  <MenuItem value="etudiant">Emploi des étudiants</MenuItem>
                  <MenuItem value="enseignant">Emploi des enseignants</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Filière</InputLabel>
                <Select
                  name="filiere_id"
                  value={formData.filiere_id}
                  onChange={handleFormChange}
                  label="Filière"
                >
                  <MenuItem value="">Sélectionnez une filière</MenuItem>
                  {filieres.map((filiere) => (
                    <MenuItem key={filiere.id} value={filiere.id}>
                      {filiere.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Classe</InputLabel>
                <Select
                  name="classe_id"
                  value={formData.classe_id}
                  onChange={handleFormChange}
                  label="Classe"
                  disabled={!formData.filiere_id}
                >
                  <MenuItem value="">Sélectionnez une classe</MenuItem>
                  {getClassesByFiliere(formData.filiere_id).map((classe) => (
                    <MenuItem key={classe.id} value={classe.id}>
                      {classe.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Semestre</InputLabel>
                <Select
                  name="semestre_id"
                  value={formData.semestre_id}
                  onChange={handleFormChange}
                  label="Semestre"
                  disabled={!formData.classe_id}
                >
                  <MenuItem value="">Sélectionnez un semestre</MenuItem>
                  {getSemestresByClasse(formData.classe_id).map((semestre) => (
                    <MenuItem key={semestre.id} value={semestre.id}>
                      S{semestre.numero} - {getClasseName(semestre.classe_id)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                component="label"
                startIcon={<PublishIcon />}
              >
                Télécharger le fichier
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.xlsx,.xls"
                />
              </Button>
              {formData.fichier && (
                <Typography variant="body2">
                  Fichier sélectionné: {formData.fichier.name}
                </Typography>
              )}
              {currentEmploi?.fichier_path && !formData.fichier && (
                <Typography variant="body2">
                  Fichier actuel: {currentEmploi.fichier_path.split("/").pop()}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
                resetFormData();
              }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !formData.filiere_id ||
                !formData.classe_id ||
                !formData.semestre_id ||
                (!formData.fichier && !currentEmploi)
              }
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : currentEmploi ? (
                "Modifier"
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default Emploi;