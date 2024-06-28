"use client";

import React from "react"
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import('@/components/P5Wrapper'), { ssr: false });

import { boidsketch, boidsliders } from "@/sketches/boidsketch";

export default function Page() {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <h1>Boids</h1>
        <P5Wrapper sketch={boidsketch} sliders={boidsliders}/>
      </Box>
    )
  }
