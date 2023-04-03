import React from 'react';
import './css/App.css';
import { Tile, TilePosition, TileRotation, TileType } from './classes/tile';

function App() {

  // map variables
  const gridSize = 64;
  const mapWidth = 8;
  const mapHeight = 5;

  var tile: Tile = new Tile(TileType.CastleCenterSide);

  return (
    <>

    </>
  );
}

export default App;
