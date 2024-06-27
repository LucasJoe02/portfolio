import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import p5 from 'p5';

const P5Wrapper = ({ sketch }) => {
  const sketchRef = useRef();

  useEffect(() => {
    const p5Instance = new p5(sketch, sketchRef.current);

    // Cleanup the p5 instance on component unmount
    return () => {
      p5Instance.remove();
    };
  }, [sketch]);

  return (
      <>
          <Box id="sketch-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}></Box>
          <div ref={sketchRef}></div>
          <div id="sliders-container"></div>
      </>
  );
};

export default P5Wrapper;
