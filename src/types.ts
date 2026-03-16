import { z } from 'zod';

// Geocoding schemas
export const GeocodingParamsSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  count: z.number().min(1).max(100).default(10).optional(),
  language: z.string().optional(),
  countryCode: z
    .string()
    .regex(/^[A-Z]{2}$/, 'Le code pays doit être au format ISO-3166-1 alpha2 (ex: FR, DE, US)')
    .optional(),
  format: z.enum(['json', 'protobuf']).default('json').optional(),
});

export const LocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  elevation: z.number().optional(),
  feature_code: z.string().optional(),
  country_code: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  admin1_id: z.number().optional(),
  admin2_id: z.number().optional(),
  admin3_id: z.number().optional(),
  admin4_id: z.number().optional(),
  timezone: z.string().optional(),
  population: z.number().min(0).optional(),
  postcodes: z.array(z.string()).optional(),
  country_id: z.number().optional(),
  country: z.string().optional(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  admin3: z.string().optional(),
  admin4: z.string().optional(),
});

export const GeocodingResponseSchema = z.object({
  results: z.array(LocationSchema),
});

export const GeocodingErrorSchema = z.object({
  error: z.boolean(),
  reason: z.string(),
});

// Weather forecast parameters (simplified — structured summary is returned, not raw arrays)
export const WeatherForecastParamsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().optional(),
});

// NWS point-based parameters (used by both get_nws_forecast and get_nws_alerts)
export const NWSPointParamsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Inferred types
export type WeatherForecastParams = z.infer<typeof WeatherForecastParamsSchema>;
export type NWSPointParams = z.infer<typeof NWSPointParamsSchema>;
export type GeocodingParams = z.infer<typeof GeocodingParamsSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type GeocodingResponse = z.infer<typeof GeocodingResponseSchema>;
export type GeocodingError = z.infer<typeof GeocodingErrorSchema>;
