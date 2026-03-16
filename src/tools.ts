import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const WEATHER_FORECAST_TOOL: Tool = {
  name: 'weather_forecast',
  description:
    'Get a structured weather summary for a location: today and tomorrow with morning/afternoon/evening breakdowns (temp, feels-like, precip chance, conditions), plus a 5-day week-ahead outlook. All temperatures in °F, wind in mph, precipitation in inches. Pass a timezone (e.g., "America/New_York") for accurate local time windows.',
  inputSchema: {
    type: 'object',
    properties: {
      latitude: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        description: 'Latitude in WGS84',
      },
      longitude: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        description: 'Longitude in WGS84',
      },
      timezone: {
        type: 'string',
        description:
          'IANA timezone name (e.g., "America/New_York", "America/Chicago"). Pass this for accurate local time windows. Defaults to auto-detect from coordinates.',
      },
    },
    required: ['latitude', 'longitude'],
  },
};

export const GEOCODING_TOOL: Tool = {
  name: 'geocoding',
  description:
    'Search for locations worldwide by place name or postal code. Returns geographic coordinates (latitude and longitude) and detailed location information. Use this tool when you need to convert a location name (e.g., "Paris", "New York") into precise coordinates (latitude/longitude) that are required by other tools. This is essential when you have a location name but need coordinates for data fetching tools.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        description:
          'Place name or postal code to search for. Minimum 2 characters required. Examples: "Paris", "Berlin", "75001", "10967"',
      },
      count: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Number of search results to return (maximum 100)',
      },
      language: {
        type: 'string',
        description:
          'Language code for translated results (e.g., "fr", "en", "de"). Returns translated results if available, otherwise in English or native language.',
      },
      countryCode: {
        type: 'string',
        pattern: '^[A-Z]{2}$',
        description:
          'ISO-3166-1 alpha2 country code to filter results (e.g., "FR", "DE", "US"). Limits search to a specific country.',
      },
      format: {
        type: 'string',
        enum: ['json', 'protobuf'],
        default: 'json',
        description: 'Return format for results',
      },
    },
    required: ['name'],
  },
};

export const GET_NWS_ALERTS_TOOL: Tool = {
  name: 'get_nws_alerts',
  description:
    'Get active weather alerts (Watches, Warnings, and Advisories) for a US location from the National Weather Service. Only works for US coordinates. Returns structured JSON with event type, severity, urgency, headline, description, and effective/expiry times. Call this first — active warnings should lead any weather briefing.',
  inputSchema: {
    type: 'object',
    properties: {
      latitude: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        description: 'Latitude in WGS84. Must be within the United States or US territories.',
      },
      longitude: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        description: 'Longitude in WGS84. Must be within the United States or US territories.',
      },
    },
    required: ['latitude', 'longitude'],
  },
};

export const GET_NWS_FORECAST_TOOL: Tool = {
  name: 'get_nws_forecast',
  description:
    'Get the official NWS narrative forecast for a US location. Only works for US coordinates. Returns up to 7 forecast periods (Today, Tonight, Tomorrow, etc.) with temperature, wind, and human-readable forecast text. Use for additional color or when the NWS narrative wording is needed.',
  inputSchema: {
    type: 'object',
    properties: {
      latitude: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        description: 'Latitude in WGS84. Must be within the United States or US territories.',
      },
      longitude: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        description: 'Longitude in WGS84. Must be within the United States or US territories.',
      },
    },
    required: ['latitude', 'longitude'],
  },
};

export const ALL_TOOLS: Tool[] = [
  WEATHER_FORECAST_TOOL,
  GEOCODING_TOOL,
  GET_NWS_ALERTS_TOOL,
  GET_NWS_FORECAST_TOOL,
];
