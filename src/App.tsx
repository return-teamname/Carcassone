import { useState, useRef } from 'react';
import './css/App.css';
import { Tile, TilePosition, TileRotation, TileType, calculateIdx, getRandomTileType, getTileValue } from './classes/tile';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import NewGridCanvas from './Canvas';

interface tileInfo {
  source: string;
  rotation: number;
  type: TileType;
}

function App(): JSX.Element {
  const width = 5;
  const height = 8;

  const [started, setStarted] = useState(false);

  const [imgSource, setImgSource] = useState("")
  const [rotate, setRotate] = useState(0);
  const [currentTileKey, setCurrentTileKey] = useState<TileType>();

  const [validTileMap, setValidTileMap] = useState<Map<number, string>>(new Map);

  const [tiles, setTiles] = useState<Map<number, Tile>>(new Map);

  const startGame = () => {
    setStarted(true);
    getRandomTile();
  }

  const getRandomTile = () => {
    setRotate(0);
    let randomTileKey: TileType = getRandomTileType()

    const imgUrl = require(`./assets/tiles/${randomTileKey}.png`)
    setCurrentTileKey(randomTileKey);
    setImgSource(imgUrl);
  }

  const imgRotation = (event: any) => {
    var newRotation = rotate >= 3 ? 0 : rotate + 1;
    setRotate(newRotation);
    //event.target.style.transform = `rotate(${newRotation * 90}deg)`
  }

  const onPlaced = (pos: [number, number, number]) => {
    const x = pos[0] + 2;
    const y = pos[1] + 3.5;
    const idx = x + y * width;
    console.log(x, y, idx);
    const newTiles = new Map(tiles);

    newTiles.set(idx, new Tile(currentTileKey as TileType, new TilePosition(x, y, rotate)));

    setTiles(newTiles);
    console.log("tiles:", tiles);
    checkValidTiles(newTiles);
    getRandomTile();
  }

  const checkValidTiles = (newTiles: Map<number, Tile>) => {
    var tileMap: Map<number, string> = new Map(validTileMap);

    newTiles.forEach((tile, key) => {
      //console.log(key, "valid for right", tile.getTileRight(), tile.pos);

      const right = calculateIdx(tile.pos.x + 1, tile.pos.y);
      const left = calculateIdx(tile.pos.x - 1, tile.pos.y);
      const up = calculateIdx(tile.pos.x, tile.pos.y + 1);
      const down = calculateIdx(tile.pos.x, tile.pos.y - 1);

      if (tile.pos.x < 4) {
        var onRight = (tileMap.get(right) ?? "4444");
        onRight = onRight.replaceAt(3, tile.getTileRight().toString());
        tileMap.set(right, onRight);
      }

      if (tile.pos.x > 0) {
        var onLeft = (tileMap.get(left) ?? "4444");
        onLeft = onLeft.replaceAt(1, tile.getTileLeft().toString());
        tileMap.set(left, onLeft);
      }

      if (tile.pos.y < 7) {
        var onUp = (tileMap.get(up) ?? "4444");
        onUp = onUp.replaceAt(2, tile.getTileTop().toString());
        tileMap.set(up, onUp);
      }

      if (tile.pos.y > 0) {
        var onDown = (tileMap.get(down) ?? "4444");
        onDown = onDown.replaceAt(0, tile.getTileBottom().toString());
        tileMap.set(down, onDown);
      }
    });

    setValidTileMap(tileMap);
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <NewGridCanvas currentTileKey={currentTileKey!} tileMap={validTileMap} width={width} height={height} onPlaced={onPlaced} started={started} rotation={rotate} tiles={tiles} />
      </div>
      <div style={{ position: "fixed", backgroundColor: "#0000005A", bottom: 0, width: "100%", padding: "12px", display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center" }}>
        <button onClick={startGame}>{started ? <FontAwesomeIcon icon={faRotate} /> : "Indítás"}</button>
        {imgSource && <div><img src={imgSource} style={{ transform: `rotate(${rotate * 90}deg)` }} className='previewImage' onClick={(event: any) => imgRotation(event)} /></div>}
      </div>
    </div>
  );
}

declare global {
  interface String {
    replaceAt(index: number, replacement: string): string;
  }
}

String.prototype.replaceAt = function (index: number, replacement: string): string {
  if (index >= this.length) {
    return this.toString();
  }
  return this.substr(0, index) + replacement + this.substr(index + 1);
};


export default App;
