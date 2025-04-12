import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Divider,
  CssBaseline,
  AppBar,
  Typography,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const AdminLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/utilisateurs' },
    { text: 'Cours', icon: <SchoolIcon />, path: '/admin/cours' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/parametres' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main 
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" color="white">
            Administration
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default
          },
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
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                      color: theme.palette.primary.contrastText,
                    }
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                      color: theme.palette.primary.contrastText,
                    }
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;