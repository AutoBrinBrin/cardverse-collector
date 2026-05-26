import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, Environment } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Pack({ image, isBox, autoRotate }: { image: string; isBox: boolean; autoRotate: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useTexture(image);
  tex.anisotropy = 16;

  useFrame((_, dt) => {
    if (autoRotate && ref.current) ref.current.rotation.y += dt * 0.5;
  });

  const [w, h, d] = isBox ? [2.2, 1.8, 2.2] : [1.4, 2.2, 0.12];

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshPhysicalMaterial
        map={tex}
        clearcoat={1}
        clearcoatRoughness={0.1}
        roughness={0.35}
        metalness={0.4}
      />
    </mesh>
  );
}

export function BoosterViewer3D({ image, isBox = false }: { image: string; isBox?: boolean }) {
  return (
    <div className="w-full h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-violet-950/40 to-black border border-white/10">
      <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
        <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#a855f7" />
        <Pack image={image} isBox={isBox} autoRotate />
        <Environment preset="city" />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
