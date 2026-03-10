import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function PrismCore() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.5;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={group} scale={0.85}>
        {/* Main prism */}
        <mesh rotation={[0.3, 0, 0]}>
          <dodecahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color="#0ea5a5"
            metalness={0.9}
            roughness={0.1}
            emissive="#0ea5a5"
            emissiveIntensity={0.4}
          />
        </mesh>
        {/* Accent inner */}
        <mesh rotation={[0.3, 0.5, 0]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color="#d946a8"
            transparent
            opacity={0.3}
            emissive="#d946a8"
            emissiveIntensity={0.6}
          />
        </mesh>
        {/* Orbiting ring */}
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[0.6, 0.018, 6, 48]} />
          <meshStandardMaterial
            color="#0ea5a5"
            emissive="#0ea5a5"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function Logo3D({ size = 48 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={0.8} color="#0ea5a5" />
        <pointLight position={[-2, -1, 2]} intensity={0.4} color="#d946a8" />
        <PrismCore />
      </Canvas>
    </div>
  );
}
