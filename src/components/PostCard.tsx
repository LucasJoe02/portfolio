import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import Link from 'next/link';

interface PostCardProps {
  title: string;
  description: string;
  img: string;
  path: string;
}

const PostCard: React.FC<PostCardProps> = ( props ) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea component={Link} href={props.path}>
        <CardMedia
          component="img"
          height="140"
          image={props.img}
          alt="post banner"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {props.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PostCard;
