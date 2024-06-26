import React from 'react';
import { Container, Grid } from '@mui/material';
import PostCard from './PostCard';

interface Item {
  id: number;
  title: string;
  description: string;
  img: string;
  path: string;
}

interface PostListProps {
  items: Item[];
}

const PostList: React.FC<PostListProps> = ({ items }) => {
  return (
    <Container>
      <Grid container spacing={2}>
        {items.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <PostCard title={item.title} description={item.description} img={item.img} path={item.path}/>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PostList;
