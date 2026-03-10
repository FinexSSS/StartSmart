import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

function GridPlane() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.005;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 20, 20]} />
      <meshStandardMaterial color="#0ea5a5" wireframe transparent opacity={0.03} emissive="#0ea5a5" emissiveIntensity={0.1} />
    </mesh>
  );
}

function Orbs() {
  return (
    <>
      <Float speed={1.5} floatIntensity={0.4}>
        <Sphere args={[0.05, 10, 10]} position={[-1.5, 0.8, -1]}>
          <meshStandardMaterial color="#0ea5a5" emissive="#0ea5a5" emissiveIntensity={0.5} transparent opacity={0.35} />
        </Sphere>
      </Float>
      <Float speed={2} floatIntensity={0.3}>
        <Sphere args={[0.04, 10, 10]} position={[1.8, -0.5, -2]}>
          <meshStandardMaterial color="#d946a8" emissive="#d946a8" emissiveIntensity={0.5} transparent opacity={0.3} />
        </Sphere>
      </Float>
    </>
  );
}

function SubtleParticles() {
  const count = 50;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 10;
      pos[i + 1] = (Math.random() - 0.5) * 10;
      pos[i + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.01} color="#0ea5a5" transparent opacity={0.15} sizeAttenuation />
    </points>
  );
}

export default function DashboardScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.05} />
        <pointLight position={[3, 3, 3]} intensity={0.2} color="#0ea5a5" />
        <Stars radius={40} depth={20} count={100} factor={1.5} saturation={0} fade speed={0.2} />
        <GridPlane />
        <Orbs />
        <SubtleParticles />
      </Canvas>
    </div>
  );
}
