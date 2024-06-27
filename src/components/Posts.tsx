import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import PostList from './PostList';

const items = [
    { id: 1, title: 'Boids', description: '', img: '/white.jpg', path: '/boids'},
    { id: 2, title: 'Draw', description: '', img: '/green.jpg', path: '/draw' },
    { id: 3, title: 'Item 3', description: '', img: '/yellow.jpg', path: '/' },
  ];

const Posts: React.FC = () => {
    return (
        <Container>
            <PostList items={items} />
        </Container>
    )
}

export default Posts;
