"use client";

import React, { useEffect, useState} from "react"
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import('@/components/P5Wrapper'), { ssr: false });

export default function Page() {
  const [boidsketch, setBoidsketch] = useState<((p: any) => void) | null>(null);
  const [boidsliders, setBoidsliders] = useState<any[] | null>(null);

  useEffect(() => {
    async function loadBoids() {
      const myModule = await import("@/sketches/boidsketch");
      setBoidsketch(() => myModule.boidsketch);
      setBoidsliders(() => myModule.boidsliders);
    }
    loadBoids();
  }, []);

  if (!boidsketch || !boidsliders) {
    return <p>Loading...</p>;
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <h1>Boids</h1>
      <P5Wrapper sketch={boidsketch} sliders={boidsliders}/>
    </Box>
  )
}
