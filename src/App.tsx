import { useState, useRef, useEffect } from 'react';
import './css/App.css';
import { Tile, TilePosition, TileRotation, TileType, calculateIdx, getRandomTileType, getTileValue, getValidTileForSide } from './classes/tile';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import NewGridCanvas from './Canvas';

export interface Points {
  cities: number;
  monas: number;
  roads: number;
  others: number;
}

export interface SavedGame {
  username: string;
  points: Points;
  tiles: string;
}

function App(): JSX.Element {
  const width = 5;
  const height = 8;

  // saving
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [currentGame, setCurrentGame] = useState<SavedGame>();

  const saveCurrentGame = (cGame: SavedGame) => {
    setCurrentGame(cGame);
    localStorage.setItem('current_save', JSON.stringify(cGame));
  }

  const saveToGames = (cGame: SavedGame) => {
    const cSave = [...savedGames, cGame];
    setSavedGames(cSave);
    localStorage.setItem('saved_games', JSON.stringify(cSave));
  }

  useEffect(() => {
    const cSavedGames = localStorage.getItem('saved_games');
    if (cSavedGames) {
      const p = JSON.parse(cSavedGames);
      setSavedGames(p);
    }

    const currentSave = localStorage.getItem('current_save');
    if (currentSave) {
      startGame();
      const p = JSON.parse(currentSave);
      var s = new Map<number, Tile>();
      const values = Object.values(JSON.parse(p.tiles));
      Object.keys(JSON.parse(p.tiles)).forEach((key, value) => {
        s.set(parseInt(key), new Tile((values[value] as Tile).type, (values[value] as Tile).pos));
      });
      setTiles(s);
      setPoints(p.points);
      setCurrentGame(JSON.parse(currentSave));
      makeCheck(s);

      saveToGames(p);
    }
  }, []);

  //others
  const [started, setStarted] = useState(false);

  const [imgSource, setImgSource] = useState("")
  const [rotate, setRotate] = useState(0);
  const [currentTileKey, setCurrentTileKey] = useState<TileType>();

  const [validTileMap, setValidTileMap] = useState<Map<number, string>>(new Map);

  const [tiles, setTiles] = useState<Map<number, Tile>>(new Map);

  const [points, setPoints] = useState<Points>({ cities: 0, monas: 0, roads: 0, others: 0 });
  const [validMoves, setValidMoves] = useState(-1);

  const startGame = () => {
    setStarted(true);
    setValidMoves(0);
    setImgSource("");
    setRotate(0);
    setPoints({ cities: 0, monas: 0, roads: 0, others: 0 });
    setCurrentTileKey(undefined);
    setTiles(new Map);
    setValidTileMap(new Map);
    getRandomTile();
    localStorage.removeItem('current_save');
  }

  const getRandomTile = () => {
    setRotate(0);
    let randomTileKey: TileType = getRandomTileType()

    const imgUrl = require(`./assets/tiles/${randomTileKey}.png`)
    setCurrentTileKey(randomTileKey);
    setImgSource(imgUrl);
    return randomTileKey;
  }

  const imgRotation = (event: any) => {
    var newRotation = rotate >= 3 ? 0 : rotate + 1;
    setRotate(newRotation);
    //event.target.style.transform = `rotate(${newRotation * 90}deg)`
  }

  const clearSaves = () => {
    localStorage.removeItem("saved_games");
    setSavedGames([]);
  }

  const makeCheck = (newTiles: Map<number, Tile>) => {
    const p = countPoints(newTiles);

    const newTileMap = checkValidTiles(newTiles);
    const newTileKey = getRandomTile();
    const newValidMoves = countValidMoves(newTiles, newTileMap, newTileKey);

    var currPoints = { cities: p.cities, monas: p.monas, roads: p.roads, others: p.others };

    if (newTiles.size == width * height) {
      currPoints = { cities: points.cities, monas: points.monas, roads: points.roads, others: points.others + 10 }
    }

    setPoints(currPoints);

    var cGame = {
      username: "",
      points: currPoints,
      tiles: JSON.stringify(Object.fromEntries(newTiles)),
    }

    if (newValidMoves == 0 || newTiles.size == width * height) {
      setTimeout(() => {
        const name = prompt("A Játék véget ért, mentéshez írd be a neved, ha nem szeretnéd menteni, hagyd üresen");
        if (name != "") {
          cGame.username = name!;
        }
        setStarted(false);

        if (cGame.username != "") {
          saveToGames(cGame);
        };
      }, 1000);
    }

    saveCurrentGame(cGame);
  }

  const onPlaced = (pos: [number, number, number]) => {
    const x = pos[0] + 2;
    const y = pos[1] + 3.5;
    const idx = x + y * width;
    console.log(x, y, idx);
    const newTiles = new Map(tiles);

    newTiles.set(idx, new Tile(currentTileKey as TileType, new TilePosition(x, y, rotate)));

    setTiles(newTiles);
    makeCheck(newTiles);
  }

  const countPoints = (newTiles: Map<number, Tile>) => {
    const arr = Array.from(newTiles.values());
    const cities = arr.filter(e => e.type.startsWith("Castle")).length * 2;
    var monas = 0;
    arr.filter(e => e.type.startsWith("Monastery")).forEach(tile => {
      if (tile.pos.x < 4 && newTiles.get(calculateIdx(tile.pos.x + 1, tile.pos.y))) monas += 1;
      if (tile.pos.x > 0 && newTiles.get(calculateIdx(tile.pos.x - 1, tile.pos.y))) monas += 1;
      if (tile.pos.y < 7 && newTiles.get(calculateIdx(tile.pos.x, tile.pos.y + 1))) monas += 1;
      if (tile.pos.y > 0 && newTiles.get(calculateIdx(tile.pos.x, tile.pos.y - 1))) monas += 1;
    });
    const roads = arr.filter(e => e.type.startsWith("Road") || e.type.endsWith("Road")).length;
    const others = 0;

    //setPoints({ cities, monas, roads, others });
    return { cities, monas, roads, others };
  }

  const checkValidTiles = (newTiles: Map<number, Tile>) => {
    var tileMap: Map<number, string> = new Map(validTileMap);

    newTiles.forEach((tile, key) => {
      //console.log(key, "valid for right", tile.getTileRight(), tile.pos);

      const right = calculateIdx(tile.pos.x + 1, tile.pos.y);
      const left = calculateIdx(tile.pos.x - 1, tile.pos.y);
      const up = calculateIdx(tile.pos.x, tile.pos.y + 1);
      const down = calculateIdx(tile.pos.x, tile.pos.y - 1);

      if (tile.pos.x < 4 && newTiles.get(right) == null) {
        var onRight = (tileMap.get(right) ?? "4444");
        onRight = onRight.replaceAt(3, tile.getTileRight().toString());
        tileMap.set(right, onRight);
      }

      if (tile.pos.x > 0 && newTiles.get(left) == null) {
        var onLeft = (tileMap.get(left) ?? "4444");
        onLeft = onLeft.replaceAt(1, tile.getTileLeft().toString());
        tileMap.set(left, onLeft);
      }

      if (tile.pos.y < 7 && newTiles.get(up) == null) {
        var onUp = (tileMap.get(up) ?? "4444");
        onUp = onUp.replaceAt(2, tile.getTileTop().toString());
        tileMap.set(up, onUp);
      }

      if (tile.pos.y > 0 && newTiles.get(down) == null) {
        var onDown = (tileMap.get(down) ?? "4444");
        onDown = onDown.replaceAt(0, tile.getTileBottom().toString());
        tileMap.set(down, onDown);
      }
    });

    setValidTileMap(tileMap);

    return tileMap;
  }

  const countValidMoves = (newTiles: Map<number, Tile>, tileMap: Map<number, string>, newTileKey: TileType) => {
    var vmoves = 0;

    tileMap.forEach((tm, key) => {
      if (newTiles.get(key) != null) return;

      const up = tm[0];
      const right = tm[1];
      const down = tm[2];
      const left = tm[3];

      for (var i = 0; i < 4; i++) {
        var valid = true;

        if (up != "4" && up != getValidTileForSide(newTileKey as TileType, 0, i).toString()) valid = false;
        else if (right != "4" && right != getValidTileForSide(newTileKey as TileType, 1, i).toString()) valid = false;
        else if (down != "4" && down != getValidTileForSide(newTileKey as TileType, 2, i).toString()) valid = false;
        else if (left != "4" && left != getValidTileForSide(newTileKey as TileType, 3, i).toString()) valid = false;

        if (valid) vmoves += 1;
      }
    });

    setValidMoves(vmoves);
    return vmoves;
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <NewGridCanvas savedGames={savedGames} validMoves={validMoves} points={points} currentTileKey={currentTileKey!} tileMap={validTileMap} width={width} height={height} onPlaced={onPlaced} started={started} rotation={rotate} tiles={tiles} />
      </div>
      <div style={{ position: "fixed", backgroundColor: "#0000005A", bottom: 0, width: "100%", padding: "12px", display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center" }}>
        {
          <button onClick={startGame}>Új játék</button>
        }
        {imgSource && <div><img src={imgSource} style={{ transform: `rotate(${rotate * 90}deg)` }} className='previewImage' onClick={(event: any) => imgRotation(event)} /></div>}
        {
          savedGames.length != 0 ?
            <button onClick={clearSaves}>Mentések törlése</button> : null
        }
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
