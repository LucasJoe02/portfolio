import React, { useEffect, useRef } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import p5 from 'p5';

interface P5WrapperProps {
  sketch: any; 
  sliders: { title: string; id: string }[];
}

const P5Wrapper: React.FC<P5WrapperProps> = ({ sketch, sliders }) => {
  const sketchRef = useRef();

  useEffect(() => {
    const p5Instance = new p5(sketch, sketchRef.current);

    // Cleanup the p5 instance on component unmount
    return () => {
      p5Instance.remove();
    };
  }, [sketch]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: '80%' }}>
        <Box id="sketch-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', '& canvas': { width: '500px !important', height: '500px !important', imageRendering: 'pixelated' } }}></Box>
        <Grid container justifyContent="center">
          {sliders.map((slider) => (
            <Grid item xs={12} sm={6} md={3} key={slider.id} sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{slider.title}</Typography>
                <div id={slider.id} style={{ display: 'flex', justifyContent: 'center' }}></div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default P5Wrapper;
