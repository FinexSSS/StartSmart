import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

function TorusKnot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.08;
      ref.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.6, 0.04, 200, 8, 2, 3]} />
      <meshStandardMaterial color="#0ea5a5" wireframe transparent opacity={0.2} emissive="#0ea5a5" emissiveIntensity={0.4} />
    </mesh>
  );
}

function HexGrid() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.02;
  });

  const hexes = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const r = 2.5 + Math.sin(i * 1.3) * 0.5;
      pts.push([Math.cos(angle) * r, Math.sin(angle) * r, (Math.random() - 0.5) * 1.5]);
    }
    return pts;
  }, []);

  return (
    <group ref={ref}>
      {hexes.map((pos, i) => (
        <Float key={i} speed={1 + i * 0.1} floatIntensity={0.3}>
          <mesh position={pos} rotation={[0, 0, Math.random() * Math.PI]}>
            <circleGeometry args={[0.12, 6]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#d946a8" : "#0ea5a5"}
              transparent
              opacity={0.15 + Math.random() * 0.15}
              emissive={i % 3 === 0 ? "#d946a8" : "#0ea5a5"}
              emissiveIntensity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function NeonParticles() {
  const count = 180;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 28;
      pos[i + 1] = (Math.random() - 0.5) * 28;
      pos[i + 2] = (Math.random() - 0.5) * 28;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#0ea5a5" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 3, 5]} intensity={0.6} color="#0ea5a5" />
        <pointLight position={[-5, -3, 5]} intensity={0.3} color="#d946a8" />
        <Stars radius={80} depth={50} count={600} factor={2} saturation={0} fade speed={0.4} />
        <TorusKnot />
        <HexGrid />
        <NeonParticles />
      </Canvas>
    </div>
  );
}
