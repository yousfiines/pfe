import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CssBaseline, 
  AppBar, 
  Toolbar,
  Typography,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  AccountTree,
  Class as ClassIcon,          // Icône pour Classe
  DateRange as SemesterIcon,   // Icône pour Semestre
  MenuBook as SubjectIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Cours', icon: <SchoolIcon />, path: '/admin/courses' },
    { text: 'Documents', icon: <DescriptionIcon />, path: '/admin/documents' },
    { text: 'Événements', icon: <EventIcon />, path: '/admin/events' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings' },
    { text: 'Filière', icon: <AccountTree />, path: '/admin/filière' },
    { text: 'Classe', icon: <ClassIcon />, path: '/admin/classe' },
    { text: 'Semestre', icon: <SemesterIcon />, path: '/admin/semestre' },
    { text: 'Matière', icon: <SubjectIcon />, path: '/admin/matière' },

  ];
  
  const handleLogout = () => {
    // Implémentez la déconnexion
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Administration - Faculté des Sciences
          </Typography>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>A</Avatar>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          ['& .MuiDrawer-paper']: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          
          <List sx={{ mt: 'auto' }}>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;