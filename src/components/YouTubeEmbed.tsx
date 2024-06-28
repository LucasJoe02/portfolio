import React from 'react';
import { Box } from '@mui/material';

interface YouTubeEmbedProps {
  videoId: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: {
            xs: '90vw',
            md: '50vw'
        },
        height: 0,
        paddingBottom: {
            xs: 'calc(90vw * 9 / 16)',
            md: 'calc(50vw * 9 / 16)'
        },
        margin: '0 auto',
        overflow: 'hidden',
        maxWidth: '100%',
        backgroundColor: 'black',
        iframe: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'None',
        },
      }}
    >
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </Box>
  );
};

export default YouTubeEmbed;