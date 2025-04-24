import React from "react";
import { Link } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Toolbar, Typography } from "@mui/material";

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: '#1976d2', color: 'white' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <List>
        <ListItem button component={Link} to="/admin/utilisateurs">
          <ListItemText primary="Utilisateurs" />
        </ListItem>
        <ListItem button component={Link} to="/admin/cours">
          <ListItemText primary="Cours" />
        </ListItem>
        <ListItem button component={Link} to="/admin/evenements">
          <ListItemText primary="Événements" />
        </ListItem>
        <ListItem button component={Link} to="/admin/statistiques">
          <ListItemText primary="Statistiques" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
