import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import PostList from './PostList';

const items = [
    { id: 1, title: 'Item 1', description: '', img: '/white.jpg' },
    { id: 2, title: 'Item 2', description: '', img: '/green.jpg' },
    { id: 3, title: 'Item 3', description: '', img: '/yellow.jpg' },
    // Add more items as needed
  ];

const Posts: React.FC = () => {
    return (
        <Container>
            <PostList items={items} />
        </Container>
    )
}

export default Posts;