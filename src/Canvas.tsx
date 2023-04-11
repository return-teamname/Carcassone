import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

const GridCell = ({
  position,
  started,
  onClick,
  texture,
  textures,
}: {
  position: [number, number, number];
  onClick: (pos: [number, number, number]) => void;
  started: boolean;
  texture: { imgSource: string, rotation: number } | undefined;
  textures: Map<number, { imgSource: string, rotation: number }>;
}) => {
  const [hovered, setHover] = useState(false);
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);
  const mesh = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (texture) {
      const loader = new THREE.TextureLoader();
      loader.load(texture.imgSource, (tex) => {
        tex.anisotropy = 16;
        console.log("rotation", texture.rotation);
        tex.rotation = (texture.rotation * -90 * Math.PI) / 180;
        tex.center.set(0.5, 0.5);
        setLoadedTexture(tex);
        if (mesh.current && mesh.current.material instanceof THREE.Material) {
          mesh.current.material.needsUpdate = true;
        }
      });
    } else {
      setLoadedTexture(null);
      if (mesh.current && mesh.current.material instanceof THREE.Material) {
        mesh.current.material.needsUpdate = true;
      }
    }
  }, [texture, textures]);

  useFrame(() => {
    if (mesh.current) {
      if (hovered) {
        mesh.current.material = new THREE.MeshStandardMaterial({ color: "green" });
      } else if (loadedTexture) {
        mesh.current.material = new THREE.MeshStandardMaterial({ map: loadedTexture, color: 0xFFFFFF, transparent: false });
      } else {
        mesh.current.material = new THREE.MeshStandardMaterial({ color: 'white' });
      }
    }
  });

  const handlePointerOver = () => started && !texture ? setHover(true) : null;
  const handlePointerOut = () => started ? setHover(false) : null;
  const handleClick = () => {
    if (!started) return;
    onClick(position);
    setHover(false);
  };

  return (
    <mesh position={position} ref={mesh} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
      <planeBufferGeometry attach="geometry" args={[1, 1]} />
      <meshBasicMaterial attach="material" color="white" />
    </mesh>
  );
};

interface GridCanvasProps {
  imgSource: string;
  rotation: number;
  started: boolean;
  tiles: Map<number, { imgSource: string, rotation: number }>;
  onPlaced: (idx: number) => void;
}

const GridCanvas: React.FC<GridCanvasProps> = ({ onPlaced, tiles, imgSource, rotation, started }) => {
  const width = 5;
  const height = 8;

  const handleClick = (pos: [number, number, number]) => {
    const i = Math.round(pos[0] + (width - 1) / 2);
    const j = Math.round(pos[1] + (height - 1) / 2);
    const idx = i + j * width;
    onPlaced(idx);
  };

  return (
    <Canvas>
      <OrbitControls />
      <pointLight position={[10, 10, 10]} />
      {Array.from({ length: width * height }, (_, idx) => {
        const i = idx % width - (width - 1) / 2;
        const j = Math.floor(idx / width) - (height - 1) / 2;
        return (
          <GridCell
            key={`${i}-${j}`}
            position={[i, j, 0]}
            started={started}
            onClick={handleClick}
            texture={tiles.get(idx)}
            textures={tiles}
          />
        );
      })}
    </Canvas>
  );
};

export default GridCanvas;