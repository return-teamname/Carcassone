import { useState, useRef } from 'react';
import './css/App.css';
import { Tile, TilePosition, TileRotation, TileType, getRandomTileType, getTileValue } from './classes/tile';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import NewGridCanvas from './Canvas';

function App(): JSX.Element {
  const [started, setStarted] = useState(false);
  const [imgSource, setImgSource] = useState("")
  const [rotate, setRotate] = useState(0);

  const [tiles, setTiles] = useState<Map<number, { imgSource: string, rotation: number }>>(new Map);

  const startGame = () => {
    setStarted(true);
    getRandomTile();
  }

  const getRandomTile = () => {
    setRotate(0);
    let randomTileKey: TileType = getRandomTileType()

    const imgUrl = require(`./assets/tiles/${randomTileKey}.png`)
    setImgSource(imgUrl);
    console.log("imgsource:", imgSource);
  }

  const imgRotation = (event: any) => {
    if (rotate >= 3) {
      setRotate(0)
    } else {
      setRotate(rotate + 1)
    }
    event.target.style.transform = `rotate(${(rotate + 1) * 90}deg)`
  }

  const onPlaced = (idx: number) => {
    const newTiles = new Map(tiles);
    newTiles.set(idx, {
      imgSource,
      rotation: rotate,
    });
    setTiles(newTiles);
    getRandomTile();
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <NewGridCanvas onPlaced={onPlaced} started={started} imgSource={imgSource} rotation={rotate} tiles={tiles} />
      </div>
      <div style={{ position: "fixed", backgroundColor: "#0000005A", bottom: 0, width: "100%", padding: "12px", display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center" }}>
        <button onClick={startGame}>{started ? <FontAwesomeIcon icon={faRotate} /> : "Indítás"}</button>
        {imgSource && <div><img src={imgSource} className='previewImage' onClick={(event: any) => imgRotation(event)} /></div>}
      </div>
    </div>
  );
}

export default App;
