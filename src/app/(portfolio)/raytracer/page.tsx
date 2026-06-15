"use client";

import React, { useEffect, useState } from "react";
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import('@/components/P5Wrapper'), { ssr: false });

export default function Page() {
  const [raytracersketch, setRaytracersketch] = useState<((p: any) => void) | null>(null);
  const [raytracersliders, setRaytracersliders] = useState<any[] | null>(null);

  useEffect(() => {
    async function loadRaytracer() {
      const myModule = await import("@/sketches/raytracersketch");
      setRaytracersketch(() => myModule.raytracersketch);
      setRaytracersliders(() => myModule.raytracersliders);
    }
    loadRaytracer();
  }, []);

  if (!raytracersketch || !raytracersliders) {
    return <p>Loading...</p>;
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <h1>Ray Tracer</h1>
      <P5Wrapper sketch={raytracersketch} sliders={raytracersliders} />
    </Box>
  );
}
