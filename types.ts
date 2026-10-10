export type Unit = "celsius" | "fahrenheit";

export interface City {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface State {
  cities: City[];
  defaultCityId: number | null;
  unit: Unit;
}

// Respuestas de las APIs de OpenMeteo (solo los campos que usamos).

export interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}
