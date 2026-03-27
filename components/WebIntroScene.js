import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Crystal({ position, color, scale = 1, speed = 1 }) {
  const meshRef = useRef(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const t = clock.getElapsedTime() * speed;
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.y = t * 0.7;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.12;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.05} />
    </mesh>
  );
}

function PulseRing() {
  const meshRef = useRef(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 1.4) * 0.08;
    meshRef.current.scale.setScalar(scale);
    meshRef.current.rotation.z = t * 0.35;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2.8, 0, 0]}>
      <torusGeometry args={[2.5, 0.08, 18, 80]} />
      <meshStandardMaterial color="#f59e0b" emissive="#7c2d12" emissiveIntensity={0.4} />
    </mesh>
  );
}

function Droplets() {
  const groupRef = useRef(null);
  const droplets = useMemo(
    () => [
      [-2.7, 1.1, -1.3],
      [2.6, -0.4, -1.2],
      [-1.9, -1.2, 0.5],
      [2.1, 1.4, 0.9],
      [0, 2, -0.8],
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.18;
  });

  return (
    <group ref={groupRef}>
      {droplets.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#14532d"
            emissiveIntensity={0.3}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

export function WebIntroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
      <color attach="background" args={['#081018']} />
      <fog attach="fog" args={['#081018', 7, 14]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={2} color="#fff7ed" />
      <pointLight position={[-4, -2, 3]} intensity={15} color="#22c55e" distance={10} />
      <PulseRing />
      <Droplets />
      <Crystal position={[-1.3, 0.2, 0]} color="#ffffff" scale={1.15} speed={0.9} />
      <Crystal position={[0.1, 0.9, -0.4]} color="#fef3c7" scale={0.95} speed={1.15} />
      <Crystal position={[1.45, -0.5, 0.2]} color="#dcfce7" scale={1.05} speed={1.3} />
      <mesh position={[0, -1.9, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial
          color="#0f172a"
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Canvas>
  );
}
