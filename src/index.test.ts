import { describe, expect, it } from 'vitest';
import { OpenMeteoClient } from './client.js';
import { ALL_TOOLS } from './tools.js';
import {
  GeocodingParamsSchema,
  LocationSchema,
  NWSPointParamsSchema,
  WeatherForecastParamsSchema,
} from './types.js';

describe('Module imports', () => {
  it('should import types successfully', () => {
    expect(WeatherForecastParamsSchema).toBeDefined();
    expect(GeocodingParamsSchema).toBeDefined();
    expect(NWSPointParamsSchema).toBeDefined();
    expect(LocationSchema).toBeDefined();
  });

  it('should validate weather forecast parameters', () => {
    expect(() =>
      WeatherForecastParamsSchema.parse({ latitude: 37.77, longitude: -122.42 }),
    ).not.toThrow();

    expect(() =>
      WeatherForecastParamsSchema.parse({
        latitude: 37.77,
        longitude: -122.42,
        timezone: 'America/Los_Angeles',
      }),
    ).not.toThrow();

    expect(() =>
      WeatherForecastParamsSchema.parse({ latitude: 91, longitude: -122.42 }),
    ).toThrow();
  });

  it('should validate geocoding parameters', () => {
    expect(() => GeocodingParamsSchema.parse({ name: 'Paris', count: 5 })).not.toThrow();

    expect(() =>
      GeocodingParamsSchema.parse({ name: 'Berlin', count: 3, language: 'fr', countryCode: 'DE' }),
    ).not.toThrow();

    expect(() => GeocodingParamsSchema.parse({ name: 'P' })).toThrow(); // too short

    expect(() => GeocodingParamsSchema.parse({ name: 'Lyon', countryCode: 'FRA' })).toThrow(
      'Le code pays doit être au format ISO-3166-1 alpha2',
    );
  });

  it('should validate NWS point parameters', () => {
    expect(() =>
      NWSPointParamsSchema.parse({ latitude: 37.77, longitude: -122.42 }),
    ).not.toThrow();

    expect(() => NWSPointParamsSchema.parse({ latitude: 91, longitude: -122.42 })).toThrow();
    expect(() => NWSPointParamsSchema.parse({ latitude: 37.77, longitude: 181 })).toThrow();
  });

  it('should have exactly 4 tools', () => {
    expect(ALL_TOOLS).toHaveLength(4);
    const names = ALL_TOOLS.map((t) => t.name);
    expect(names).toContain('weather_forecast');
    expect(names).toContain('geocoding');
    expect(names).toContain('get_nws_alerts');
    expect(names).toContain('get_nws_forecast');
  });

  it('should import client successfully', () => {
    expect(OpenMeteoClient).toBeDefined();
    const client = new OpenMeteoClient();
    expect(client).toBeInstanceOf(OpenMeteoClient);
  });
});
