import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          component={Link}
          href='/'
        >
          <img src="/favicon.ico" alt="Home" style={{ width: '40px', height: '40px' }}/>
        </IconButton>
        <Typography sx={{ flexGrow: 1 }}/>
        <Button color="inherit" component={Link} href='/'>Home</Button>
        <Button color="inherit" component={Link} href='/complaints'>Complaints</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
