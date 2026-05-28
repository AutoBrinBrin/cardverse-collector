import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, Environment, useGLTF, Center, Bounds } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import defaultBoosterGlb from "@/assets/booster-default.glb?url";

function ImagePack({ image, isBox }: { image: string; isBox: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useTexture(image);
  tex.anisotropy = 16;
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.4; });
  const [w, h, d] = isBox ? [2.2, 1.8, 2.2] : [1.4, 2.2, 0.12];
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshPhysicalMaterial map={tex} clearcoat={1} clearcoatRoughness={0.1} roughness={0.35} metalness={0.4} />
    </mesh>
  );
}

function GlbPack({ url }: { url: string }) {
  const ref = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.4; });
  return (
    <Bounds fit clip observe margin={1.1}>
      <group ref={ref}>
        <Center>
          <primitive object={scene.clone()} />
        </Center>
      </group>
    </Bounds>
  );
}

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[1.4, 2.2, 0.12]} />
      <meshStandardMaterial color="#4c1d95" />
    </mesh>
  );
}

export function BoosterViewer3D({ image, isBox = false, modelUrl }: { image: string; isBox?: boolean; modelUrl?: string | null }) {
  const url = modelUrl || defaultBoosterGlb;
  return (
    <div className="w-full h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-violet-950/40 to-black border border-white/10">
      <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
        <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#a855f7" />
        <Suspense fallback={<Fallback />}>
          {url ? <GlbPack url={url} /> : <ImagePack image={image} isBox={isBox} />}
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(defaultBoosterGlb);
