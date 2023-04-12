import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, OrbitControls } from '@react-three/drei';
import { Tile, TileType, getValidTileForSide } from './classes/tile';

import { Points } from './App';

import { TextureLoader } from "three";

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import montserrat from './assets/fonts/montserrat.json';

import { extend, Object3DNode } from "@react-three/fiber";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
extend({ TextGeometry });

declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
  }
}

interface TextProps {
  text: string;
  position: [number, number, number];
}

const Text: React.FC<TextProps> = ({ text, position }) => {
  const font = new FontLoader().parse(montserrat);

  return (
    <mesh position={position}>
      <textGeometry args={[text, { font, size: 0.5, height: 0.05, curveSegments: 12, bevelEnabled: true, bevelThickness: .05, bevelSize: .03, bevelOffset: 0, bevelSegments: 1 }]} />
      <meshLambertMaterial attach='material' color={'gold'} />
    </mesh>
  )
}

interface BackgroundProps {
  imageUrl: string;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  const { scene } = useThree();
  const texture = useLoader(TextureLoader, imageUrl);

  useEffect(() => {
    if (texture) {
      scene.background = texture;
    }
    return () => {
      scene.background = null;
    };
  }, [scene, texture]);

  return null;
};


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
      } else if (valid) {
        mesh.current.material = new THREE.MeshStandardMaterial({ color: 'lightgreen' });
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

  const backgroundImageUrl = require("./assets/bg/carsonne_bg.jpeg");

  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <React.Suspense fallback={null}>
        <Background imageUrl={backgroundImageUrl} />
      </React.Suspense>
      <OrbitControls />
      <pointLight position={[-10, 10, -5]} />
      <pointLight position={[10, -10, 5]} />
      <Box material={new THREE.MeshStandardMaterial({ color: 0x70351d })} position={[width, 0, -.6]} scale={[width * 3 + 2, height + 2, 1]} />
      <Box material={new THREE.MeshStandardMaterial({ color: 0x70351d })} position={[width * 2 + 2.5, height / 2, -5]} scale={[1, 1, 8]} />
      <Box material={new THREE.MeshStandardMaterial({ color: 0x70351d })} position={[-2.5, height / 2, -5]} scale={[1, 1, 8]} />
      <Box material={new THREE.MeshStandardMaterial({ color: 0x70351d })} position={[width * 2 + 2.5, - height / 2, -5]} scale={[1, 1, 8]} />
      <Box material={new THREE.MeshStandardMaterial({ color: 0x70351d })} position={[- 2.5, - height / 2, -5]} scale={[1, 1, 8]} />
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
            position={[3.5, 3, 0]}
            text={`Városokért pontok: ${points.cities}`}
          />
          <Text
            position={[3.5, 2, 0]}
            text={`Kolostorokért pontok: ${points.monas}`}
          />
          <Text
            position={[3.5, 1, 0]}
            text={`Utakért pontok: ${points.roads}`}
          />
          <Text
            position={[3.5, 0, 0]}
            text={`Egyéb pontok: ${points.others}`}
          />
          <Text
            position={[3.5, -1, 0]}
            text={`Összesen: ${points.roads + points.cities + points.monas + points.others}`}
          />
          <Text
            position={[3.5, -3, 0]}
            text={`Lehetséges lerakások: ${validMoves == -1 ? width * height * 4 : validMoves}`}
          />
        </> : null
      }
    </Canvas>
  );
};

export default GridCanvas;