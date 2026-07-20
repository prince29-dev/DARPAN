export interface Trip {
  id: string;
  routeId: string;
  serviceId: string;
  headsign: string | null;
  shortName: string | null;
  directionId: number | null;
  shapeId: string | null;
  stopCount: number;
}
