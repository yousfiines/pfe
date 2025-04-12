import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios'; // Importez axios pour les requêtes HTTP

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envoyer les identifiants au serveur pour vérification
      const response = await axios.post('http://localhost/votre_api/admin_login.php', {
        email: credentials.email,
        password: credentials.password
      });

      if (response.data.success) {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Connexion Admin
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mot de passe"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Se connecter
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default AdminLogin;