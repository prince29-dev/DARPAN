export interface ShapePoint {
  lat: number;
  lon: number;
  sequence: number;
  distTraveled: number | null;
}

export interface Shape {
  id: string;
  points: ShapePoint[];
}
