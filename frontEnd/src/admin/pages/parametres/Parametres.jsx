import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  FormControlLabel, 
  Switch,
  Alert
} from '@mui/material';
import { updateSettings } from '../../../services/apiParametres';

const Parametres = () => {
  const [parametres, setParametres] = useState({
    nomSite: 'Mon École',
    maintenance: false,
    emailContact: 'contact@ecole.com'
  });
  const [message, setMessage] = useState(null);
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      await updateSettings(parametres);
      setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Échec de la mise à jour' });
    } finally {
      setChargement(false);
    }
  };

  return (
    <Box component={Paper} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Paramètres du site
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom du site"
          variant="outlined"
          fullWidth
          value={parametres.nomSite}
          onChange={(e) => setParametres({...parametres, nomSite: e.target.value})}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Email de contact"
          type="email"
          variant="outlined"
          fullWidth
          value={parametres.emailContact}
          onChange={(e) => setParametres({...parametres, emailContact: e.target.value})}
          sx={{ mb: 3 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={parametres.maintenance}
              onChange={(e) => setParametres({...parametres, maintenance: e.target.checked})}
              color="primary"
            />
          }
          label="Mode maintenance"
          sx={{ mb: 3, display: 'block' }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={chargement}
          startIcon={chargement ? <CircularProgress size={20} /> : null}
        >
          Enregistrer les modifications
        </Button>
      </form>
    </Box>
  );
};

export default Parametres;