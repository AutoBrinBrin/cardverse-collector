import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Card = { name: string; rarity: string; element: string; power: number; art_color: string };

function makeCardTexture(card: Card) {
  const c = document.createElement("canvas");
  c.width = 500; c.height = 700;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 500, 700);
  const rarityColors: Record<string, [string, string]> = {
    common: ["#64748b", "#1e293b"],
    rare: ["#38bdf8", "#1e3a8a"],
    epic: ["#c084fc", "#581c87"],
    legendary: ["#fbbf24", "#b91c1c"],
  };
  const [a, b] = rarityColors[card.rarity] ?? rarityColors.common;
  grad.addColorStop(0, a); grad.addColorStop(1, b);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 500, 700);

  // art area
  const art = ctx.createRadialGradient(150, 200, 30, 250, 250, 280);
  art.addColorStop(0, card.art_color); art.addColorStop(1, "#000");
  ctx.fillStyle = art; ctx.fillRect(20, 20, 460, 460);

  // glyph
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "180px serif"; ctx.textAlign = "center";
  const glyph = card.element === "fire" ? "🔥" : card.element === "water" ? "💧" : card.element === "earth" ? "🌿" : card.element === "air" ? "🌪️" : "✨";
  ctx.fillText(glyph, 250, 290);

  // header chips
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(30, 30, 180, 38);
  ctx.fillRect(290, 30, 180, 38);
  ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "left"; ctx.fillText(card.rarity.toUpperCase(), 45, 56);
  ctx.textAlign = "right"; ctx.fillText(`⚡ ${card.power}`, 460, 56);

  // name banner
  ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(20, 520, 460, 160);
  ctx.fillStyle = "#fff"; ctx.font = "bold 36px serif"; ctx.textAlign = "center";
  ctx.fillText(card.name, 250, 580);
  ctx.font = "20px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(card.element.toUpperCase(), 250, 620);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  return tex;
}

function CardMesh({ card }: { card: Card }) {
  const ref = useRef<THREE.Group>(null);
  const front = useMemo(() => makeCardTexture(card), [card]);
  const back = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 500; c.height = 700;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 500, 700);
    g.addColorStop(0, "#1e1b4b"); g.addColorStop(1, "#0f172a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 500, 700);
    ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 6; ctx.strokeRect(30, 30, 440, 640);
    ctx.fillStyle = "#a78bfa"; ctx.font = "bold 56px serif"; ctx.textAlign = "center";
    ctx.fillText("✦ ARCANA ✦", 250, 370);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.3; });

  return (
    <group ref={ref}>
      <RoundedBox args={[1.6, 2.24, 0.04]} radius={0.08} smoothness={6}>
        <meshPhysicalMaterial attach="material-0" color="#1e1b4b" clearcoat={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-1" color="#1e1b4b" clearcoat={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-2" color="#1e1b4b" clearcoat={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-3" color="#1e1b4b" clearcoat={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-4" map={front} clearcoat={1} clearcoatRoughness={0.05} roughness={0.25} metalness={0.3} />
        <meshPhysicalMaterial attach="material-5" map={back} clearcoat={1} clearcoatRoughness={0.05} roughness={0.25} metalness={0.3} />
      </RoundedBox>
    </group>
  );
}

export function CardViewer3D({ card }: { card: Card }) {
  return (
    <div className="w-full h-[420px] sm:h-[560px] rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/50 to-black border border-white/10">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={1.3} />
        <directionalLight position={[-2, -1, -3]} intensity={0.5} color="#a855f7" />
        <CardMesh card={card} />
        <Environment preset="studio" />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
