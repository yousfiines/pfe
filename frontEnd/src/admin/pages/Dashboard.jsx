import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  People as PeopleIcon, 
  School as SchoolIcon,
  Event as EventIcon 
} from '@mui/icons-material';
import { fetchDashboardStats } from '../../services/apiAdmin';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h5">{stats?.utilisateurs || 0}</Typography>
                <Typography variant="body2">Utilisateurs</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h5">{stats?.cours || 0}</Typography>
                <Typography variant="body2">Cours</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h5">{stats?.evenements || 0}</Typography>
                <Typography variant="body2">Événements</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Dernières inscriptions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats?.dernieresInscriptions?.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.prenom} {user.nom}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'admin' && 'Administrateur'}
                  {user.role === 'enseignant' && 'Enseignant'}
                  {user.role === 'etudiant' && 'Étudiant'}
                </TableCell>
                <TableCell>
                  {new Date(user.dateInscription).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Dashboard;