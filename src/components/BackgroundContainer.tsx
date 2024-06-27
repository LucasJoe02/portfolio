import { Box } from '@mui/material';
import React from 'react';

const BackgroundContainer = ({ children, }: Readonly<{ children: React.ReactNode; }>) => {
  return (
    <Box
      sx={{
        backgroundImage: 'url(/back.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: '60px',
        paddingTop: '0vh'
      }}
    >
      {children}
    </Box>
  );
};

export default BackgroundContainer;
