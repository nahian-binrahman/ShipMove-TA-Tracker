"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'

function Ocean() {
    const mesh = useRef<THREE.Mesh>(null!)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        mesh.current.position.y = Math.sin(time * 0.5) * 0.1
        mesh.current.rotation.x = -Math.PI / 2 + Math.cos(time * 0.3) * 0.02
    })

    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
                color="#0f172a"
                transparent
                opacity={0.8}
                roughness={0.1}
                metalness={0.8}
            />
        </mesh>
    )
}

function Ship() {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={[0, -0.5, 0]}>
                {/* Hull */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[4, 1, 1.5]} />
                    <meshStandardMaterial color="#334155" roughness={0.5} />
                </mesh>

                {/* Bow (Pointed front) */}
                <mesh position={[2.5, 0, 0]} rotation={[0, 0, 0]}>
                    <coneGeometry args={[0.75, 1, 4]} rotation={[0, 0, -Math.PI / 2]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>

                {/* Superstructure */}
                <mesh position={[-0.5, 0.8, 0]}>
                    <boxGeometry args={[2, 0.8, 1.2]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>

                {/* Bridge */}
                <mesh position={[0, 1.4, 0]}>
                    <boxGeometry args={[0.8, 0.6, 1]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>

                {/* Funnel */}
                <mesh position={[-0.8, 1.6, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
            </group>
        </Float>
    )
}

export default function TacticalShipScene() {
    return (
        <div className="w-full h-full min-h-[400px] relative overflow-hidden rounded-xl bg-slate-950">
            <Canvas
                shadows
                gl={{ antialias: true, powerPreference: "high-performance" }}
                dpr={[1, 2]} // Performance: bracket DPR
            >
                <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={35} />

                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <spotLight
                    position={[-10, 15, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={2}
                    castShadow
                />

                <Ship />
                <Ocean />

                <fog attach="fog" args={['#0f172a', 10, 25]} />
            </Canvas>

            {/* HUD Overlay for aesthetic */}
            <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl" />
            <div className="absolute top-4 left-4 font-mono text-[10px] text-primary/40 uppercase tracking-widest">
                Tactical Viz // Unit 01-BN
            </div>
        </div>
    )
}
