import axios, { type AxiosInstance } from 'axios';
import { processWeatherForecast, type WeatherSummary } from './forecast-processor.js';
import type { GeocodingParams, GeocodingResponse, WeatherForecastParams } from './types.js';

export class OpenMeteoClient {
  private client: AxiosInstance;
  private geocodingClient: AxiosInstance;

  constructor(baseURL: string = process.env.OPEN_METEO_API_URL || 'https://api.open-meteo.com') {
    const config = {
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Open-Meteo-MCP-Server/1.0.0',
      },
    };

    const geocodingURL =
      process.env.OPEN_METEO_GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com';

    this.client = axios.create({ baseURL, ...config });
    this.geocodingClient = axios.create({ baseURL: geocodingURL, ...config });
  }

  async getWeatherSummary(params: WeatherForecastParams): Promise<WeatherSummary> {
    const response = await this.client.get('/v1/forecast', {
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        timezone: params.timezone ?? 'auto',
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        precipitation_unit: 'inch',
        forecast_days: 7,
        hourly:
          'temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,weather_code',
        daily:
          'temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,wind_speed_10m_max,weather_code',
      },
    });
    return processWeatherForecast(params, response.data);
  }

  async getGeocoding(params: GeocodingParams): Promise<GeocodingResponse> {
    const response = await this.geocodingClient.get('/v1/search', { params });
    return response.data;
  }
}
