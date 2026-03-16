import type { WeatherForecastParams } from './types.js';

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Light freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail',
};

// Ascending severity order (most benign → most severe)
const WMO_SEVERITY: number[] = [
  0, 1, 2, 3, 45, 48,
  51, 53, 55, 56, 57,
  61, 63, 80, 81, 71, 73, 85, 77,
  65, 82, 66, 75, 86,
  67,
  95, 96, 99,
];

function severityIndex(code: number): number {
  const idx = WMO_SEVERITY.indexOf(code);
  return idx === -1 ? 0 : idx;
}

function mostSevereCode(codes: number[]): number {
  if (codes.length === 0) return 0;
  return codes.reduce((prev, curr) => (severityIndex(curr) > severityIndex(prev) ? curr : prev));
}

function wmoDescription(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? 'Unknown';
}

function roundOne(n: number): number {
  return Math.round(n * 10) / 10;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return roundOne(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function getWindowIndices(
  hourlyTimes: string[],
  date: string,
  startHour: number,
  endHour: number, // exclusive
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < hourlyTimes.length; i++) {
    const t = hourlyTimes[i];
    if (!t || t.slice(0, 10) !== date) continue;
    const hour = parseInt(t.slice(11, 13), 10);
    if (hour >= startHour && hour < endHour) indices.push(i);
  }
  return indices;
}

interface DayWindow {
  window: string;
  temp_f: number;
  feels_like_f: number;
  precip_chance_pct: number;
  conditions: string;
}

interface DayDetail {
  date: string;
  high_f: number;
  low_f: number;
  feels_like_high_f: number;
  feels_like_low_f: number;
  precip_total_in: number;
  max_wind_mph: number;
  conditions: string;
  morning: DayWindow;
  afternoon: DayWindow;
  evening: DayWindow;
}

interface WeekDay {
  date: string;
  high_f: number;
  low_f: number;
  feels_like_high_f: number;
  precip_total_in: number;
  conditions: string;
}

export interface WeatherSummary {
  location: { latitude: number; longitude: number; timezone: string };
  generated_at: string;
  today: DayDetail;
  tomorrow: DayDetail;
  week_ahead: WeekDay[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processWeatherForecast(params: WeatherForecastParams, data: any): WeatherSummary {
  const h = data.hourly as {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };

  const d = data.daily as {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    weather_code: number[];
  };

  const timezone: string = (data.timezone as string) ?? params.timezone ?? 'UTC';

  function buildWindow(date: string, startHour: number, endHour: number, label: string): DayWindow {
    const idx = getWindowIndices(h.time, date, startHour, endHour);
    if (idx.length === 0) {
      return { window: label, temp_f: 0, feels_like_f: 0, precip_chance_pct: 0, conditions: 'Unknown' };
    }
    return {
      window: label,
      temp_f: avg(idx.map((i) => h.temperature_2m[i] ?? 0)),
      feels_like_f: avg(idx.map((i) => h.apparent_temperature[i] ?? 0)),
      precip_chance_pct: Math.max(...idx.map((i) => h.precipitation_probability[i] ?? 0)),
      conditions: wmoDescription(mostSevereCode(idx.map((i) => h.weather_code[i] ?? 0))),
    };
  }

  function buildDayDetail(dayIndex: number): DayDetail {
    const date = d.time[dayIndex] ?? '';
    return {
      date,
      high_f: roundOne(d.temperature_2m_max[dayIndex] ?? 0),
      low_f: roundOne(d.temperature_2m_min[dayIndex] ?? 0),
      feels_like_high_f: roundOne(d.apparent_temperature_max[dayIndex] ?? 0),
      feels_like_low_f: roundOne(d.apparent_temperature_min[dayIndex] ?? 0),
      precip_total_in: Math.round((d.precipitation_sum[dayIndex] ?? 0) * 100) / 100,
      max_wind_mph: roundOne(d.wind_speed_10m_max[dayIndex] ?? 0),
      conditions: wmoDescription(d.weather_code[dayIndex] ?? 0),
      morning: buildWindow(date, 6, 10, '6am–9am'),
      afternoon: buildWindow(date, 12, 16, '12pm–3pm'),
      evening: buildWindow(date, 16, 21, '4pm–8pm'),
    };
  }

  const weekAhead: WeekDay[] = [];
  for (let i = 2; i < Math.min(d.time.length, 7); i++) {
    const date = d.time[i] ?? '';
    weekAhead.push({
      date,
      high_f: roundOne(d.temperature_2m_max[i] ?? 0),
      low_f: roundOne(d.temperature_2m_min[i] ?? 0),
      feels_like_high_f: roundOne(d.apparent_temperature_max[i] ?? 0),
      precip_total_in: Math.round((d.precipitation_sum[i] ?? 0) * 100) / 100,
      conditions: wmoDescription(d.weather_code[i] ?? 0),
    });
  }

  return {
    location: { latitude: params.latitude, longitude: params.longitude, timezone },
    generated_at: new Date().toISOString().slice(0, 16),
    today: buildDayDetail(0),
    tomorrow: buildDayDetail(1),
    week_ahead: weekAhead,
  };
}
