import { Box } from '@mui/material';
import React from 'react';

const BackgroundContainer = ({ children, }: Readonly<{ children: React.ReactNode; }>) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: '60px',
        paddingTop: '5vh',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/back_v1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7,
          zIndex: -1,
        }}
      />
      {children}
    </Box>
  );
};

export default BackgroundContainer;
