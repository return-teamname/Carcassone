import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Tile, TileType, getValidTileForSide } from './classes/tile';

import { Text } from '@react-three/drei';
import { Points } from './App';

const GridCell = ({
  position,
  started,
  onClick,
  texture,
  textures,
  tileMap,
  idx,
  currentTileKey,
  rotation,
}: {
  position: [number, number, number];
  onClick: (pos: [number, number, number]) => void;
  started: boolean;
  texture?: Tile;
  textures: Map<number, Tile>;
  tileMap: Map<number, string>;
  idx: number,
  rotation: number,
  currentTileKey: TileType;
}) => {
  const [hovered, setHover] = useState(false);
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);
  const mesh = useRef<THREE.Mesh>(null!);

  const currentTileMap = tileMap.get(idx);
  const currentTileValue = Object.values(TileType)[Object.keys(TileType).indexOf(currentTileKey)];

  var valid = currentTileMap != null;
  //console.log(idx, "before", valid);
  if (currentTileMap) {
    const up = currentTileMap[0];
    const right = currentTileMap[1];
    const down = currentTileMap[2];
    const left = currentTileMap[3];

    if (up != "4" && up != getValidTileForSide(currentTileKey as TileType, 0, rotation).toString()) valid = false;
    else if (right != "4" && right != getValidTileForSide(currentTileKey as TileType, 1, rotation).toString()) valid = false;
    else if (down != "4" && down != getValidTileForSide(currentTileKey as TileType, 2, rotation).toString()) valid = false;
    else if (left != "4" && left != getValidTileForSide(currentTileKey as TileType, 3, rotation).toString()) valid = false;
  } else if (textures.size == 0) {
    valid = true;
  }
  //console.log(idx, "after", valid);

  useEffect(() => {
    if (texture) {
      const loader = new THREE.TextureLoader();
      loader.load(texture.getImage(), (tex) => {
        tex.anisotropy = 16;
        tex.rotation = (texture.getRotation() * -90 * Math.PI) / 180;
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

  const handlePointerOver = () => started && !texture && valid ? setHover(true) : null;
  const handlePointerOut = () => started ? setHover(false) : null;
  const handleClick = () => {
    if (!started || texture || !valid) return;
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
  width: number;
  height: number;
  rotation: number;
  started: boolean;
  tiles: Map<number, Tile>;
  tileMap: Map<number, string>;
  currentTileKey: TileType;
  points: Points;
  validMoves: number;
  onPlaced: (pos: [number, number, number]) => void;
}

const GridCanvas: React.FC<GridCanvasProps> = ({ width, height, validMoves, points, rotation, tileMap, currentTileKey, onPlaced, tiles, started }) => {
  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <OrbitControls />
      <pointLight position={[10, 10, 10]} />
      {Array.from({ length: width * height }, (_, idx) => {
        const i = idx % width - (width - 1) / 2;
        const j = Math.floor(idx / width) - (height - 1) / 2;
        return (
          <GridCell
            key={`${i}-${j}`}
            position={[i, j, 0]}
            idx={idx}
            started={started}
            onClick={onPlaced}
            texture={tiles.get(idx)}
            textures={tiles}
            rotation={rotation}
            currentTileKey={currentTileKey}
            tileMap={tileMap}
          />
        );
      })}
      {
        started ? <>
          <Text
            position={[3, 3, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="left"
            anchorY="middle"
          >
            Városért pontok: {points.cities}
          </Text>
          <Text
            position={[3, 2, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="left"
            anchorY="middle"
          >
            Kolostorért pontok: {points.monas}
          </Text>
          <Text
            position={[3, 1, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="left"
            anchorY="middle"
          >
            Utakért pontok: {points.roads}
          </Text>
          <Text
            position={[3, 0, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="left"
            anchorY="middle"
          >
            Egyéb pontok: {points.others}
          </Text>
          <Text
            position={[3, -1, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="left"
            anchorY="middle"
          >
            Összesen: {points.roads + points.cities + points.monas + points.others}
          </Text>
          <Text
            position={[3, -3, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="left"
            anchorY="middle"
          >
            Lehetséges lerakások: {validMoves == -1 ? width * height * 4 : validMoves}
          </Text>
        </> : null
      }
    </Canvas>
  );
};

export default GridCanvas;