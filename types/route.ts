export interface RouteSummary {
  id: string;
  shortName: string | null;
  longName: string;
  color: string | null;
  textColor: string | null;
  type: number;
  tripCount: number;
}
