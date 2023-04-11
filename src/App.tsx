import { useState, useRef } from 'react';
import './css/App.css';
import { Tile, TilePosition, TileRotation, TileType, getRandomTileType, getTileValue } from './classes/tile';
import Canvas from './Canvas';

function App(): JSX.Element {
  const [randomTileButtonText, setRandomTileButtonText] = useState("Játék elkezdése")
  const [tiles, setTiles] = useState<Tile[]>([])
  const [imgSource, setImgSource] = useState("")
  const [rotate, setRotate] = useState(90)

  const getRandomTile = () => {
    if (randomTileButtonText == "Játék elkezdése") {
      setRandomTileButtonText("Új kártya")
    }

    let randomTileKey: TileType = getRandomTileType()

    let tile: Tile = new Tile(randomTileKey);

    setTiles(prevTiles => [...prevTiles, tile])

    const imgUrl = require(`./assets/tiles/${randomTileKey}.png`)
    setImgSource(imgUrl)

  }

  const imgRotation = (event: any) => {
    if (rotate + 90 >= 360) {
      setRotate(0)
    } else {
      setRotate(rotate + 90)
    }
    event.target.style.transform = `rotate(${rotate}deg)`
    console.log(event.target)
  }

  // map variables
  const gridSize = 100;
  const mapWidth = 5;
  const mapHeight = 8;

  return (
    <>
      <section className="menu">
        <h1>Carcassone</h1>
        <button onClick={getRandomTile}>{randomTileButtonText}</button>
        {imgSource && <div><img src={imgSource} className='previewImage' onClick={(event: any) => imgRotation(event)} /></div>}
      </section>
      <Canvas 
        width={gridSize * mapWidth + 20}
        height={gridSize * mapHeight + 20}
        className="canvas"
        tiles={tiles}
        imgurl={[imgSource, setImgSource]}
        rotate={[rotate-90, setRotate]} />
    </>
  );
}

export default App;
