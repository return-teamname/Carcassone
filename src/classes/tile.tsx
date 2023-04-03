enum TileTypeIndex {
  Sheer = "0", // puszta
  Road = "1", // ut
  Castle = "2", // varos
  Monastery = "3", // kolostor
}

enum TileType {
  CastleCenter = "2222",
  CastleCenterEntry = "2212",
  CastleCenterSide = "2202",
  CastleCenterSides = "0020",
  CastleEdge = "",
  CastleEdgeRoad = "",
  CastleMini = "",
  CastleSides = "",
  CastleSidesEdge = "",
  CastleSidesEdgeRoad = "",
  CastleSidesQuad = "",
  CastleSidesRoad = "",
  CastleTube = "",
  CastleTubeEntries = "",
  CastleTubeEntry = "",
  CastleWall = "",
  CastleWallCurveLeft = "",
  CastleWallCurveRight = "",
  CastleWallEntry = "",
  CastleWallEntryLeft = "",
  CastleWallEntryRight = "",
  CastleWallJunction = "",
  CastleWallRoad = "",
  Monastery = "",
  MonasteryCastle = "",
  MonasteryJunction = "",
  MonasteryRoad = "",
  Road = "",
  RoadCrossLarge = "",
  RoadCrossSmall = "",
  RoadCurve = "",
  RoadEnd = "",
  RoadJunctionLarge = "",
  RoadJunctionSmall = "",
}

enum TileRotation {
  Up = "0",
  Right = "1",
  Down = "2",
  Left = "3"
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

class Tile {
  type: TileType;
  pos: TilePosition = new TilePosition(0, 0, TileRotation.Up);

  constructor(type: TileType, pos?: TilePosition) {
    this.type = type;
    this.pos = pos ?? this.pos;
  }

  getRotation(): TileRotation {
    return this.pos.rot;
  }

  getSideByIndex(index: number) {
    if (index < 0) {
      return index + 4;
    }
    return index;
  }

  getValidTileForSide(side: number): number {
    var index = side - parseInt(this.pos.rot);
    var sideByIndex = this.getSideByIndex(index);
    return parseInt(this.type[sideByIndex]);
  }

  getTileRight(): number {
    return this.getValidTileForSide(1);
  }

  getTileLeft(): number {
    return this.getValidTileForSide(3);
  }

  getTileBottom(): number {
    return this.getValidTileForSide(2);
  }

  getTileTop(): number {
    return this.getValidTileForSide(0);
  }

}

export {
  TileType,
  TilePosition,
  TileRotation,
  Tile,
}