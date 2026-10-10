export type Unit = "celsius" | "fahrenheit";

export interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}

export interface DailyForecast {
  date: string; // "2026-10-10"
  max: number;
  min: number;
}

// Respuesta del pronóstico diario (tres arreglos paralelos, todos opcionales).
export interface ForecastDailyResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}
