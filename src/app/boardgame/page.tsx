'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PieceDef {
  id: string;
  name: string;
  shape: 'hex' | 'square' | 'rect' | 'circle';
  color: string;
  stroke: string;
  width: number;
  height: number;
  total: number;
  label?: string;
  palette?: ColourOption[]; // colour picked from this palette at drag time
}

interface ColourOption {
  key: string;
  name: string;
  color: string;
  stroke: string;
}

interface PlacedPiece {
  instanceId: string;
  defId: string;
  x: number;
  y: number;
  rotation: number; // 0 | 90 | 180 | 270
  text?: string;
  colour?: string; // COLOURS key, for colourable defs
}

interface DragState {
  defId: string;
  instanceId: string | null; // null = from inventory
  ghostX: number;
  ghostY: number;
  rotation: number;
  colour?: string;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

// ─── Piece Definitions ───────────────────────────────────────────────────────

const TILE_COLOURS: ColourOption[] = [
  { key: 'forest',   name: 'Forest',   color: '#2d6a2d', stroke: '#1a4a1a' },
  { key: 'water',    name: 'Water',    color: '#2565a0', stroke: '#1a3d70' },
  { key: 'plains',   name: 'Plains',   color: '#8faa40', stroke: '#5a6e20' },
  { key: 'mountain', name: 'Mountain', color: '#6b6b6b', stroke: '#3a3a3a' },
  { key: 'desert',   name: 'Desert',   color: '#d8c078', stroke: '#a08a40' },
  { key: 'clay',     name: 'Clay',     color: '#b05c34', stroke: '#7a3a1c' },
  { key: 'wheat',    name: 'Wheat',    color: '#e0b83c', stroke: '#a5821e' },
];

const STRUCT_COLOURS: ColourOption[] = [
  { key: 'tan', name: 'Tan', color: '#c4a882', stroke: '#7a5010' },
  ...TILE_COLOURS,
];

const PAWN_COLOURS: ColourOption[] = [
  { key: 'red',    name: 'Red',    color: '#c0392b', stroke: '#7b241c' },
  { key: 'blue',   name: 'Blue',   color: '#2980b9', stroke: '#1a5276' },
  { key: 'green',  name: 'Green',  color: '#27ae60', stroke: '#1a6e3e' },
  { key: 'yellow', name: 'Yellow', color: '#f39c12', stroke: '#9a6100' },
  { key: 'grey',   name: 'Grey',   color: '#95a5a6', stroke: '#5d6d6e' },
];

const PIECE_DEFS: PieceDef[] = [
  { id: 'tile',     name: 'Tile',     shape: 'hex',    color: '#2d6a2d', stroke: '#1a4a1a', width: 80,  height: 70, total: 6, palette: TILE_COLOURS },
  { id: 'room',     name: 'Room',     shape: 'square', color: '#c4a882', stroke: '#7a5010', width: 80,  height: 80, total: 8, palette: STRUCT_COLOURS },
  { id: 'corridor', name: 'Corridor', shape: 'rect',   color: '#c4a882', stroke: '#7a5010', width: 160, height: 80, total: 4, palette: STRUCT_COLOURS },
  { id: 'pawn',     name: 'Pawn',     shape: 'circle', color: '#c0392b', stroke: '#7b241c', width: 40,  height: 40, total: 4, palette: PAWN_COLOURS },
  // Slightly shorter than a hex edge (~40) so roads sit inside tile borders
  { id: 'road',     name: 'Road',     shape: 'rect',   color: '#c0392b', stroke: '#7b241c', width: 34,  height: 12, total: 8, palette: PAWN_COLOURS },
];

const DEF_MAP: Record<string, PieceDef> = Object.fromEntries(PIECE_DEFS.map(d => [d.id, d]));

// Inventory is tracked per colour for palette defs ("pawn:red"), per def otherwise.
const invKey = (defId: string, colour?: string) =>
  DEF_MAP[defId].palette && colour ? `${defId}:${colour}` : defId;

// A def with its colour applied — what the renderer actually draws.
function effectiveDef(def: PieceDef, colour?: string): PieceDef {
  if (!def.palette || !colour) return def;
  const c = def.palette.find(p => p.key === colour);
  return c ? { ...def, color: c.color, stroke: c.stroke } : def;
}

// ─── SVG Piece Renderer ──────────────────────────────────────────────────────

function PieceText({ text, w, h, stroke }: { text: string; w: number; h: number; stroke: string }) {
  return (
    <text
      x={w / 2} y={h / 2}
      dominantBaseline="central"
      textAnchor="middle"
      fontSize={Math.max(8, Math.min(13, (w / text.length) * 1.4))}
      fill="#fff"
      stroke={stroke}
      strokeWidth={0.5}
      paintOrder="stroke"
      fontFamily="sans-serif"
      fontWeight="bold"
      style={{ pointerEvents: 'none' }}
    >
      {text}
    </text>
  );
}

function PieceShape({ def, w, h, glowing, text }: { def: PieceDef; w: number; h: number; glowing?: boolean; text?: string }) {
  const glow = glowing
    ? `drop-shadow(0 0 ${Math.max(6, w * 0.1)}px rgba(255,255,255,0.95)) drop-shadow(0 0 ${Math.max(3, w * 0.05)}px ${def.color})`
    : undefined;

  if (def.shape === 'hex') {
    const pts = [
      [w * 0.25, 0], [w * 0.75, 0],
      [w, h * 0.5],
      [w * 0.75, h], [w * 0.25, h],
      [0, h * 0.5],
    ].map(([x, y]) => `${x},${y}`).join(' ');
    return (
      <svg width={w} height={h} style={{ display: 'block', filter: glow }}>
        <polygon points={pts} fill={def.color} stroke={def.stroke} strokeWidth={2} />
        {text && <PieceText text={text} w={w} h={h} stroke={def.stroke} />}
      </svg>
    );
  }

  if (def.shape === 'circle') {
    const r = Math.min(w, h) / 2;
    return (
      <svg width={w} height={h} style={{ display: 'block', filter: glow }}>
        <circle cx={w / 2} cy={h / 2} r={r - 1} fill={def.color} stroke={def.stroke} strokeWidth={2} />
        <circle cx={w / 2 - r * 0.2} cy={h / 2 - r * 0.25} r={r * 0.2} fill="rgba(255,255,255,0.25)" />
        {text && <PieceText text={text} w={w} h={h} stroke={def.stroke} />}
      </svg>
    );
  }

  // square / rect
  return (
    <svg width={w} height={h} style={{ display: 'block', filter: glow }}>
      <rect x={1} y={1} width={w - 2} height={h - 2} rx={3} fill={def.color} stroke={def.stroke} strokeWidth={2} />
      {text
        ? <PieceText text={text} w={w} h={h} stroke={def.stroke} />
        : def.label && (
          <text
            x={w / 2} y={h / 2 + 4}
            textAnchor="middle"
            fontSize={Math.min(13, w / 7)}
            fill={def.stroke}
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {def.label}
          </text>
        )}
    </svg>
  );
}

// ─── Snap Logic ──────────────────────────────────────────────────────────────

const SNAP_DIST = 25;
const HEX_SNAP_DIST = 30;

// The 6 neighbour offsets for our flat-side-top/bottom hex, as (dx/w, dy/h) multipliers.
// Derived from vertex geometry: points at left/right, flat edges top/bottom.
const HEX_NEIGHBOUR_OFFSETS: [number, number][] = [
  [0,      -1  ],  // top
  [0.75,  -0.5 ],  // top-right
  [0.75,   0.5 ],  // bottom-right
  [0,      1   ],  // bottom
  [-0.75,  0.5 ],  // bottom-left
  [-0.75, -0.5 ],  // top-left
];

function snapPosition(
  x: number, y: number,
  def: PieceDef,
  placed: PlacedPiece[],
  excludeId: string | null,
): { x: number; y: number } {
  if (def.shape === 'circle') return { x, y };

  // ── Hex snap: find the closest valid neighbour slot among all placed hexes ──
  if (def.shape === 'hex') {
    let best = HEX_SNAP_DIST;
    let sx = x, sy = y;

    for (const other of placed) {
      if (other.instanceId === excludeId) continue;
      const od = DEF_MAP[other.defId];
      if (!od || od.shape !== 'hex') continue;

      for (const [mx, my] of HEX_NEIGHBOUR_OFFSETS) {
        const cx = other.x + mx * od.width;
        const cy = other.y + my * od.height;
        const dist = Math.hypot(x - cx, y - cy);
        if (dist < best) { best = dist; sx = cx; sy = cy; }
      }
    }
    return { x: sx, y: sy };
  }

  // ── Rectangle snap: align bounding-box edges ─────────────────────────────
  let sx = x, sy = y;
  let bestX = SNAP_DIST, bestY = SNAP_DIST;

  for (const other of placed) {
    if (other.instanceId === excludeId) continue;
    const od = DEF_MAP[other.defId];
    if (!od || od.shape === 'circle' || od.shape === 'hex') continue;

    const candidates: [number, 'x' | 'y', number][] = [
      [Math.abs((x + def.width) - other.x),                  'x', other.x - def.width],
      [Math.abs(x - (other.x + od.width)),                   'x', other.x + od.width],
      [Math.abs(x - other.x),                                'x', other.x],
      [Math.abs((x + def.width) - (other.x + od.width)),     'x', other.x + od.width - def.width],
      [Math.abs((y + def.height) - other.y),                 'y', other.y - def.height],
      [Math.abs(y - (other.y + od.height)),                  'y', other.y + od.height],
      [Math.abs(y - other.y),                                'y', other.y],
      [Math.abs((y + def.height) - (other.y + od.height)),   'y', other.y + od.height - def.height],
    ];

    for (const [dist, axis, val] of candidates) {
      if (axis === 'x' && dist < bestX) { bestX = dist; sx = val; }
      if (axis === 'y' && dist < bestY) { bestY = dist; sy = val; }
    }
  }

  return { x: sx, y: sy };
}

// ─── Dice ────────────────────────────────────────────────────────────────────

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const;

interface DiceResult {
  sides: number;
  rolls: number[];
}

// ─── Main Page ───────────────────────────────────────────────────────────────

let idCounter = 0;

const NAVBAR_HEIGHT = 64;
const SIDEBAR_WIDTH = 210;
const GHOST_SCALE = 1.15;

export default function BoardGamePage() {
  const [inv, setInv] = useState<Record<string, number>>(
    () => Object.fromEntries(PIECE_DEFS.flatMap(d =>
      d.palette ? d.palette.map(c => [`${d.id}:${c.key}`, d.total]) : [[d.id, d.total]]
    ))
  );
  // Currently selected colour per palette def
  const [pieceColour, setPieceColour] = useState<Record<string, string>>(
    () => Object.fromEntries(PIECE_DEFS.filter(d => d.palette).map(d => [d.id, d.palette![0].key]))
  );
  const [placed, setPlaced] = useState<PlacedPiece[]>([]);
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [drag, setDrag] = useState<DragState | null>(null);
  const [editing, setEditing] = useState<{ instanceId: string; value: string; sx: number; sy: number } | null>(null);
  const [diceCounts, setDiceCounts] = useState<Record<number, number>>(
    () => Object.fromEntries(DICE_TYPES.map(s => [s, 0]))
  );
  const [diceResults, setDiceResults] = useState<DiceResult[] | null>(null);
  const [diceOpen, setDiceOpen] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });

  // Stable refs so event handlers don't go stale
  const dragRef = useRef(drag);
  useEffect(() => { dragRef.current = drag; }, [drag]);
  const transformRef = useRef(transform);
  useEffect(() => { transformRef.current = transform; }, [transform]);
  const placedRef = useRef(placed);
  useEffect(() => { placedRef.current = placed; }, [placed]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const screenToBoard = (sx: number, sy: number): { x: number; y: number } => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const t = transformRef.current;
    return {
      x: (sx - rect.left - t.x) / t.scale,
      y: (sy - rect.top - t.y) / t.scale,
    };
  };

  const isOverSidebar = (sx: number): boolean => {
    const rect = sidebarRef.current?.getBoundingClientRect();
    return rect ? sx >= rect.left && sx <= rect.right : false;
  };

  // ── wheel zoom ───────────────────────────────────────────────────────────

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      setTransform(prev => {
        const newScale = Math.max(0.2, Math.min(5, prev.scale * factor));
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        return {
          scale: newScale,
          x: mx - (mx - prev.x) * (newScale / prev.scale),
          y: my - (my - prev.y) * (newScale / prev.scale),
        };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── global mouse events ──────────────────────────────────────────────────

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isPanning.current) {
        setTransform(prev => ({
          ...prev,
          x: panStart.current.tx + (e.clientX - panStart.current.mx),
          y: panStart.current.ty + (e.clientY - panStart.current.my),
        }));
      }
      setDrag(d => d ? { ...d, ghostX: e.clientX, ghostY: e.clientY } : null);
    };

    const onUp = (e: MouseEvent) => {
      if (isPanning.current) { isPanning.current = false; return; }

      const d = dragRef.current;
      if (!d) return;

      if (isOverSidebar(e.clientX)) {
        // ── return to inventory ──
        if (d.instanceId) {
          setPlaced(p => p.filter(x => x.instanceId !== d.instanceId));
          setInv(inv => ({ ...inv, [invKey(d.defId, d.colour)]: inv[invKey(d.defId, d.colour)] + 1 }));
        }
      } else {
        // ── place on board ──
        const def = DEF_MAP[d.defId];
        const bp = screenToBoard(e.clientX, e.clientY);
        let x = bp.x - def.width / 2;
        let y = bp.y - def.height / 2;
        const snapped = snapPosition(x, y, def, placedRef.current, d.instanceId);
        x = snapped.x;
        y = snapped.y;

        if (d.instanceId) {
          // Move to end of array so it renders on top
          setPlaced(p => {
            const rest = p.filter(piece => piece.instanceId !== d.instanceId);
            const moved = p.find(piece => piece.instanceId === d.instanceId)!;
            return [...rest, { ...moved, x, y, rotation: d.rotation }];
          });
        } else {
          const instanceId = `p${idCounter++}`;
          setPlaced(p => [...p, { instanceId, defId: d.defId, x, y, rotation: d.rotation, colour: d.colour }]);
          setInv(inv => ({ ...inv, [invKey(d.defId, d.colour)]: inv[invKey(d.defId, d.colour)] - 1 }));
        }
      }
      setDrag(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if ((e.key === 'r' || e.key === 'R') && dragRef.current) {
        e.preventDefault();
        // Roads rotate in 30° steps so they can align with hex edges (0/60/120°)
        const step = DEF_MAP[dragRef.current.defId].id === 'road' ? 30 : 90;
        setDrag(d => d ? { ...d, rotation: (d.rotation + step) % 360 } : null);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []); // empty — reads from refs

  // ── drag start handlers ──────────────────────────────────────────────────

  const startFromInventory = (defId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const colour = DEF_MAP[defId].palette ? pieceColour[defId] : undefined;
    if (inv[invKey(defId, colour)] <= 0) return;
    setDrag({ defId, instanceId: null, ghostX: e.clientX, ghostY: e.clientY, rotation: 0, colour });
  };

  const startFromBoard = (piece: PlacedPiece, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag({ defId: piece.defId, instanceId: piece.instanceId, ghostX: e.clientX, ghostY: e.clientY, rotation: piece.rotation, colour: piece.colour });
  };

  const startEditText = (piece: PlacedPiece, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(null);
    setEditing({ instanceId: piece.instanceId, value: piece.text ?? '', sx: e.clientX, sy: e.clientY });
  };

  const rollDice = () => {
    const results: DiceResult[] = DICE_TYPES
      .filter(s => diceCounts[s] > 0)
      .map(s => ({
        sides: s,
        rolls: Array.from({ length: diceCounts[s] }, () => 1 + Math.floor(Math.random() * s)),
      }));
    if (results.length) setDiceResults(results);
  };

  const commitEditText = () => {
    if (!editing) return;
    const text = editing.value.trim();
    setPlaced(p => p.map(piece =>
      piece.instanceId === editing.instanceId ? { ...piece, text: text || undefined } : piece
    ));
    setEditing(null);
  };

  const startPan = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
    }
  };

  // ── ghost sizing ─────────────────────────────────────────────────────────

  const dragDef = drag ? effectiveDef(DEF_MAP[drag.defId], drag.colour) : null;
  const gw = dragDef ? dragDef.width * transform.scale * GHOST_SCALE : 0;
  const gh = dragDef ? dragDef.height * transform.scale * GHOST_SCALE : 0;

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{
      display: 'flex',
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      mt: `${NAVBAR_HEIGHT}px`,
      overflow: 'hidden',
      userSelect: 'none',
    }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Box
        ref={sidebarRef}
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: 'rgba(12, 18, 28, 0.98)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        <Box sx={{
          px: 2, py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          textAlign: 'center',
        }}>
          INVENTORY
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {PIECE_DEFS.map(rawDef => {
            const selColour = rawDef.palette ? pieceColour[rawDef.id] : undefined;
            const def = effectiveDef(rawDef, selColour);
            const avail = inv[invKey(def.id, selColour)];
            const enabled = avail > 0;
            const thumbW = Math.min(def.width, 44);
            const thumbH = def.shape === 'hex'
              ? Math.round(thumbW * (def.height / def.width))
              : def.shape === 'rect' ? Math.round(thumbW * (def.height / def.width))
              : thumbW;

            return (
              <Box
                key={def.id}
                onMouseDown={enabled ? e => startFromInventory(def.id, e) : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: '7px 10px',
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: enabled ? 'grab' : 'not-allowed',
                  opacity: enabled ? 1 : 0.3,
                  transition: 'background 0.15s, transform 0.1s',
                  '&:hover': enabled ? {
                    bgcolor: 'rgba(255,255,255,0.09)',
                    transform: 'scale(1.02)',
                  } : {},
                }}
              >
                <Box sx={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PieceShape def={def} w={thumbW} h={thumbH} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {def.name}
                  </Box>
                  <Box sx={{ fontSize: 11, mt: '2px', color: avail > 0 ? 'rgba(100,210,130,0.85)' : 'rgba(220,80,80,0.7)' }}>
                    {avail} / {def.total}
                  </Box>
                  {rawDef.palette && (
                    <Box
                      onMouseDown={e => e.stopPropagation()}
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}
                    >
                      {rawDef.palette.map(c => (
                        <Box
                          key={c.key}
                          onClick={() => setPieceColour(pc => ({ ...pc, [rawDef.id]: c.key }))}
                          title={c.name}
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: c.color,
                            cursor: 'pointer',
                            border: c.key === selColour
                              ? '2px solid rgba(255,255,255,0.9)'
                              : '2px solid transparent',
                            boxSizing: 'border-box',
                            '&:hover': { transform: 'scale(1.2)' },
                            transition: 'transform 0.1s',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)', fontSize: 10, lineHeight: 1.8 }}>
          Drag onto board · Drag back to return<br />
          Hold &amp; press <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px', px: 0.5, fontSize: 10 }}>R</Box> to rotate<br />
          Double-click a piece to add text
        </Box>
      </Box>

      {/* ── Board ───────────────────────────────────────────────────────── */}
      <Box
        ref={boardRef}
        onMouseDown={startPan}
        onContextMenu={e => e.preventDefault()}
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#0d1520',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`,
          backgroundPosition: `${transform.x % (40 * transform.scale)}px ${transform.y % (40 * transform.scale)}px`,
          cursor: drag ? 'grabbing' : 'default',
        }}
      >
        {/* World layer */}
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0,
          width: 4000, height: 4000,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}>
          {placed.map(piece => {
            const def = effectiveDef(DEF_MAP[piece.defId], piece.colour);
            const isGhost = drag?.instanceId === piece.instanceId;
            return (
              <Box
                key={piece.instanceId}
                onMouseDown={e => startFromBoard(piece, e)}
                onDoubleClick={e => startEditText(piece, e)}
                sx={{
                  position: 'absolute',
                  left: piece.x,
                  top: piece.y,
                  width: def.width,
                  height: def.height,
                  cursor: 'grab',
                  opacity: isGhost ? 0.15 : 1,
                  transition: 'opacity 0.1s',
                  zIndex: isGhost ? 0 : 1,
                  transform: `rotate(${piece.rotation}deg)`,
                  transformOrigin: 'center center',
                  '&:hover': { filter: 'brightness(1.15)' },
                }}
              >
                <PieceShape def={def} w={def.width} h={def.height} text={piece.text} />
              </Box>
            );
          })}
        </Box>

        {/* Empty hint */}
        {placed.length === 0 && !drag && (
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            color: 'rgba(255,255,255,0.15)',
          }}>
            <Box sx={{ fontSize: 18, mb: 0.75 }}>Drag pieces from the inventory</Box>
            <Box sx={{ fontSize: 12 }}>Scroll to zoom · Right-click drag to pan</Box>
          </Box>
        )}
        {/* ── Dice roller ─────────────────────────────────────────────── */}
        <Box
          onMouseDown={e => e.stopPropagation()}
          sx={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            width: 220,
            bgcolor: 'rgba(12, 18, 28, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 1.5,
            zIndex: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <Box
            onClick={() => setDiceOpen(o => !o)}
            sx={{
              px: 1.5, py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            }}
          >
            <span>DICE</span>
            <span>{diceOpen ? '▾' : '▴'}</span>
          </Box>

          {diceOpen && (
            <Box sx={{ px: 1.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {DICE_TYPES.map(s => (
                <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 32, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>
                    d{s}
                  </Box>
                  {(['-', '+'] as const).map(op => (
                    <Box
                      key={op}
                      onClick={() => setDiceCounts(dc => ({
                        ...dc,
                        [s]: Math.max(0, Math.min(20, dc[s] + (op === '+' ? 1 : -1))),
                      }))}
                      sx={{
                        width: 20, height: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '4px',
                        bgcolor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 13,
                        cursor: 'pointer',
                        order: op === '-' ? 0 : 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
                      }}
                    >
                      {op}
                    </Box>
                  ))}
                  <Box sx={{
                    order: 1, width: 24, textAlign: 'center', fontSize: 12,
                    color: diceCounts[s] > 0 ? '#fff' : 'rgba(255,255,255,0.25)',
                  }}>
                    {diceCounts[s]}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Box
            onClick={rollDice}
            sx={{
              mx: 1.5, mb: diceResults ? 1 : 1.5, mt: diceOpen ? 0.5 : 0,
              py: 0.75,
              textAlign: 'center',
              borderRadius: 1,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              bgcolor: Object.values(diceCounts).some(c => c > 0) ? 'rgba(100,180,255,0.2)' : 'rgba(255,255,255,0.04)',
              color: Object.values(diceCounts).some(c => c > 0) ? '#8ec9ff' : 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(100,180,255,0.25)',
              cursor: Object.values(diceCounts).some(c => c > 0) ? 'pointer' : 'not-allowed',
              '&:hover': Object.values(diceCounts).some(c => c > 0) ? { bgcolor: 'rgba(100,180,255,0.3)' } : {},
            }}
          >
            ROLL
          </Box>

          {diceResults && (
            <Box sx={{ px: 1.5, pb: 1.5, borderTop: '1px solid rgba(255,255,255,0.07)', pt: 1 }}>
              {diceResults.map(r => (
                <Box key={r.sides} sx={{ display: 'flex', gap: 1, fontSize: 12, lineHeight: 1.8 }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.45)', width: 32, flexShrink: 0 }}>d{r.sides}</Box>
                  <Box sx={{ color: '#fff', flex: 1 }}>{r.rolls.join(', ')}</Box>
                  <Box sx={{ color: 'rgba(100,210,130,0.85)' }}>{r.rolls.reduce((a, b) => a + b, 0)}</Box>
                </Box>
              ))}
              {(diceResults.length > 1 || diceResults[0].rolls.length > 1) && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 12 }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.45)' }}>Total</Box>
                  <Box sx={{ color: '#8ec9ff', fontWeight: 700 }}>
                    {diceResults.flatMap(r => r.rolls).reduce((a, b) => a + b, 0)}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Text edit overlay ───────────────────────────────────────────── */}
      {editing && (
        <Box
          component="input"
          autoFocus
          value={editing.value}
          placeholder="Type label…"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing(ed => ed ? { ...ed, value: e.target.value } : null)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') commitEditText();
            if (e.key === 'Escape') setEditing(null);
          }}
          onBlur={commitEditText}
          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{
            position: 'fixed',
            left: editing.sx - 70,
            top: editing.sy - 44,
            width: 140,
            zIndex: 10000,
            bgcolor: 'rgba(10, 16, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 1,
            outline: 'none',
            color: '#fff',
            fontSize: 13,
            px: 1,
            py: 0.75,
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}
        />
      )}

      {/* ── Drag ghost ──────────────────────────────────────────────────── */}
      {drag && dragDef && (
        <>
          <Box sx={{
            position: 'fixed',
            left: drag.ghostX - gw / 2,
            top: drag.ghostY - gh / 2,
            width: gw,
            height: gh,
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: 0.9,
            transform: `rotate(${drag.rotation}deg)`,
            transformOrigin: 'center center',
          }}>
            <PieceShape def={dragDef} w={gw} h={gh} glowing />
          </Box>
          {/* R-to-rotate hint badge */}
          <Box sx={{
            position: 'fixed',
            left: drag.ghostX + gw / 2 + 10,
            top: drag.ghostY - gh / 2,
            pointerEvents: 'none',
            zIndex: 9999,
            bgcolor: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            whiteSpace: 'nowrap',
          }}>
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '3px',
              px: 0.75,
              py: 0.25,
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}>
              R
            </Box>
            <Box sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              rotate {drag.rotation}°
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
