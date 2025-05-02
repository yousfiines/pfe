import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Event as EventIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Gestion des Utilisateurs",
      description: "Gérez les comptes étudiants, enseignants et administrateurs",
      icon: <PeopleIcon fontSize="large" />,
      path: "/admin/utilisateurs",
      color: "#1976d2"
    },
    {
      title: "Gestion des Cours",
      description: "Ajoutez et modifiez les cours, TD, TP et ressources",
      icon: <SchoolIcon fontSize="large" />,
      path: "/admin/cours",
      color: "#9c27b0"
    },
    {
      title: "Documents",
      description: "Gérez tous les documents partagés sur la plateforme",
      icon: <DescriptionIcon fontSize="large" />,
      path: "/admin/documents",
      color: "#2e7d32"
    },
    {
      title: "Statistiques",
      description: "Consultez les données d'utilisation de la plateforme",
      icon: <BarChartIcon fontSize="large" />,
      path: "/admin/statistiques",
      color: "#ff9800"
    },
    {
      title: "Événements",
      description: "Planifiez des conférences et ateliers",
      icon: <EventIcon fontSize="large" />,
      path: "/admin/evenements",
      color: "#e91e63"
    },
    {
      title: "Paramètres",
      description: "Configurez les paramètres de la plateforme",
      icon: <SettingsIcon fontSize="large" />,
      path: "/admin/parametres",
      color: "#607d8b"
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography color='blue' variant="h3" gutterBottom sx={{ mb: 4 }}>
        Tableau de bord administratif
      </Typography>

      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  color: feature.color,
                  mb: 2
                }}>
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  sx={{ backgroundColor: feature.color }}
                  onClick={() => navigate(feature.path)}
                >
                  Accéder
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;