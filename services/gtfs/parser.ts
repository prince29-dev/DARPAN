/**
 * GTFS text files are comma-separated with an optional quoted-field form
 * (RFC 4180-ish). This parser handles both the plain unquoted rows the
 * DMRC feed ships today and quoted fields containing commas, in case a
 * future feed revision needs them — without pulling in a CSV dependency
 * for what is, structurally, a very small grammar.
 */

export type CsvRow = Record<string, string>;

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

export function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r\n|\n|\r/).filter((line) => line.length > 0);
  const firstLine = lines[0];
  if (firstLine === undefined) return [];

  const header = splitCsvLine(firstLine).map((key) => key.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    const cells = splitCsvLine(line);
    const row: CsvRow = {};
    header.forEach((key, index) => {
      row[key] = (cells[index] ?? "").trim();
    });
    rows.push(row);
  }

  return rows;
}

export interface GtfsAgencyRow {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
}

export interface GtfsCalendarRow {
  service_id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  start_date: string;
  end_date: string;
}

export interface GtfsRouteRow {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc: string;
  route_type: string;
  route_color: string;
  route_text_color: string;
}

export interface GtfsStopRow {
  stop_id: string;
  stop_code: string;
  stop_name: string;
  stop_desc: string;
  stop_lat: string;
  stop_lon: string;
}

export interface GtfsTripRow {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  trip_short_name: string;
  direction_id: string;
  block_id: string;
  shape_id: string;
}

export interface GtfsStopTimeRow {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: string;
}

export interface GtfsShapeRow {
  shape_id: string;
  shape_pt_lat: string;
  shape_pt_lon: string;
  shape_pt_sequence: string;
  shape_dist_traveled: string;
}

export function parseAgency(content: string): GtfsAgencyRow[] {
  return parseCsv(content) as unknown as GtfsAgencyRow[];
}

export function parseCalendar(content: string): GtfsCalendarRow[] {
  return parseCsv(content) as unknown as GtfsCalendarRow[];
}

export function parseRoutes(content: string): GtfsRouteRow[] {
  return parseCsv(content) as unknown as GtfsRouteRow[];
}

export function parseStops(content: string): GtfsStopRow[] {
  return parseCsv(content) as unknown as GtfsStopRow[];
}

export function parseTrips(content: string): GtfsTripRow[] {
  return parseCsv(content) as unknown as GtfsTripRow[];
}

export function parseStopTimes(content: string): GtfsStopTimeRow[] {
  return parseCsv(content) as unknown as GtfsStopTimeRow[];
}

export function parseShapes(content: string): GtfsShapeRow[] {
  return parseCsv(content) as unknown as GtfsShapeRow[];
}
