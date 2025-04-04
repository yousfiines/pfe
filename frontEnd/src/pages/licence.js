import React from 'react';

const ListeComponent = () => {
  // Style container
  const containerStyle = {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '1rem',
    fontFamily: 'Arial, sans-serif'
  };

  // Style titre
  const titreStyle = {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '1.5rem'
  };

  // Style liste
  const listeStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  // Style élément
  const elementStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease'
  };

  // Style élément hover
  const elementHoverStyle = {
    ...elementStyle,
    transform: 'translateY(-2px)',
    backgroundColor: '#e9ecef'
  };

  // Style infos
  const infosStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  // Style nom
  const nomStyle = {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginBottom: '0.3rem'
  };

  // Style couleur
  const couleurStyle = {
    fontSize: '0.9rem',
    opacity: 0.8
  };

  // Style prix
  const prixStyle = {
    fontWeight: 'bold',
    color: '#2ecc71',
    fontSize: '1.2rem'
  };

  // Données de la liste
  const elements = [
    { id: 1, nom: 'Science informatique'},
    { id: 2, nom: 'Agroalimentaire' },
    { id: 3, nom: "Technologie de l'information et de la communication" },
    { id: 4, nom: "Math et pyhsique"},
    
  ];

  return (
    <div style={containerStyle}>
      <h1 style={titreStyle}>Liste des filières universitaire</h1>
      <ul style={listeStyle}>
        {elements.map((element) => (
          <li 
            key={element.id} 
            style={elementStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = ''}
          >
            <div style={infosStyle}>
              <span style={nomStyle}>{element.nom}</span>
              <span style={{ ...couleurStyle, color: element.couleur }}>
                {element.couleur}
              </span>
            </div>
            <span style={prixStyle}>{element.prix} </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListeComponent;