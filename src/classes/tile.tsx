enum TileTypeIndex {
  Sheer = "0", // puszta
  Road = "1", // ut
  Castle = "2", // varos
  Monastery = "3", // kolostor
  Anything = "4",
}

enum TileType {
  CastleCenter = "2222",
  CastleCenterEntry = "2212",
  CastleCenterSide = "2202",
  CastleCenterSides = "0020",
  CastleEdge = "2200",
  CastleEdgeRoad = "2211",
  CastleMini = "0010",
  CastleSides = "2020",
  CastleSidesEdge = "2002",
  CastleSidesEdgeRoad = "2112",
  CastleSidesQuad = "2222",
  CastleSidesRoad = "2121",
  CastleTube = "0202",
  CastleTubeEntries = "1212",
  CastleTubeEntry = "0212",
  CastleWall = "2000",
  CastleWallCurveLeft = "2011",
  CastleWallCurveRight = "2110",
  CastleWallEntry = "2010",
  CastleWallEntryLeft = "2001",
  CastleWallEntryRight = "2100",
  CastleWallJunction = "2111",
  CastleWallRoad = "2101",
  Monastery = "0000",
  MonasteryCastle = "2222",
  MonasteryJunction = "1111",
  MonasteryRoad = "0010",
  Road = "1010",
  RoadCrossLarge = "1111",
  RoadCrossSmall = "0111",
  RoadCurve = "0011",
  RoadEnd = "0010",
  RoadJunctionLarge = "1111",
  RoadJunctionSmall = "0111",
}

function getRandomTileType(): TileType {
  const tileTypes = Object.keys(TileType);
  const randomIndex = Math.floor(Math.random() * tileTypes.length);
  return tileTypes[randomIndex] as TileType;
}

function getTileValue(key: string): string | undefined {
  return TileType[key as keyof typeof TileType];
}

enum TileRotation {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3
}

class TilePosition {
  x: number;
  y: number;
  rot: TileRotation;

  constructor(x: number, y: number, rot: TileRotation) {
    this.x = x;
    this.y = y;
    this.rot = rot;
  }
}

const calculateIdx = (x: number, y: number, width: number = 5, height: number = 8): number => {
  const idx = x + y * width;
  return idx;
}

const getSideByIndex = (index: number) => {
  if (index < 0) {
    return index + 4;
  }
  return index;
}

const getValidTileForSide = (type: TileType, side: number, rotation: number): number => {
  var index = side - rotation;
  var sideByIndex = getSideByIndex(index);
  return parseInt(Object.values(TileType)[Object.keys(TileType).indexOf(type)][sideByIndex]);
}

class Tile {
  type: TileType;
  pos: TilePosition = new TilePosition(0, 0, TileRotation.Up);

  constructor(type: TileType, pos?: TilePosition) {
    this.type = type;
    this.pos = pos ?? this.pos;
  }

  getIdx(width: number = 5, height: number = 8): number {
    return calculateIdx(this.pos.x, this.pos.y, width = width, height = height);
  }

  getImage(): string {
    return require(`../assets/tiles/${this.type}.png`);
  }

  getRotation(): TileRotation {
    return this.pos.rot;
  }

  getValidTileFor(side: number): number {
    return getValidTileForSide(this.type, side, this.pos.rot);
  }

  getTileRight(): number {
    return this.getValidTileFor(1);
  }

  getTileLeft(): number {
    return this.getValidTileFor(3);
  }

  getTileBottom(): number {
    return this.getValidTileFor(2);
  }

  getTileTop(): number {
    return this.getValidTileFor(0);
  }
}

export {
  TileType,
  TilePosition,
  TileRotation,
  Tile,
  getRandomTileType,
  getTileValue,
  calculateIdx,
  getValidTileForSide
}