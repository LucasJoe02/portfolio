import React from 'react';
import Navbar from "./Navbar";
import BackgroundContainer from "./BackgroundContainer";
import { Paper } from '@mui/material';

const MainLayout = ({ children, }: Readonly<{ children: React.ReactNode; }>) => {
  return (
    <div>
      <Navbar />
      <BackgroundContainer>
      <Paper
          sx={{
          textAlign: 'center',
          width: '100%',
          maxWidth: '1200px',
          minHeight: 'calc(100vh - 20vh)',
          marginBottom: '40px',
          padding: '20px',
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }} 
      >
          {children}
      </Paper>
      </BackgroundContainer>
    </div>
    
  );
};

export default MainLayout;
