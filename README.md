# weather-mcp

[![npm version](https://badge.fury.io/js/%40kleprevost%2Fweather-mcp.svg)](https://www.npmjs.com/package/@kleprevost/weather-mcp)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that gives AI assistants structured, actionable weather data — combining Open-Meteo forecasts with National Weather Service alerts and narratives.

Built for AI agents that need to make clothing recommendations, flag precipitation windows, and surface severe weather without processing raw meteorological arrays.

## Tools

### `weather_forecast`
Returns a structured summary for a location: today and tomorrow with morning/afternoon/evening breakdowns, plus a 5-day week-ahead outlook.

- **Input:** `latitude`, `longitude`, `timezone` (optional, e.g. `"America/New_York"`)
- **Output:** Pre-processed JSON with temps (°F), feels-like, precip totals (inches), wind (mph), and plain-English conditions derived from WMO weather codes
- **Source:** Open-Meteo forecast API

```json
{
  "location": { "latitude": 37.66, "longitude": -77.41, "timezone": "America/New_York" },
  "generated_at": "2026-03-16T11:00",
  "today": {
    "date": "2026-03-16",
    "high_f": 72.1,
    "low_f": 44.5,
    "feels_like_high_f": 69.8,
    "feels_like_low_f": 34.1,
    "precip_total_in": 0.38,
    "max_wind_mph": 28.1,
    "conditions": "Moderate rain",
    "morning": { "window": "6am–9am", "temp_f": 66, "feels_like_f": 65, "precip_chance_pct": 27, "conditions": "Overcast" },
    "afternoon": { "window": "12pm–3pm", "temp_f": 71, "feels_like_f": 69, "precip_chance_pct": 27, "conditions": "Overcast" },
    "evening": { "window": "4pm–8pm", "temp_f": 63, "feels_like_f": 59, "precip_chance_pct": 65, "conditions": "Light rain" }
  },
  "tomorrow": { "...": "same shape as today" },
  "week_ahead": [
    { "date": "2026-03-18", "high_f": 43.7, "low_f": 30.3, "feels_like_high_f": 36.8, "precip_total_in": 0, "conditions": "Overcast" }
  ]
}
```

---

### `get_nws_alerts`
Returns active NWS Watches, Warnings, and Advisories for a US location. Non-actionable statement types are filtered out.

- **Input:** `latitude`, `longitude` (US coordinates only)
- **Output:** Structured JSON with event, severity, urgency, headline, description, effective/expiry times
- **Source:** `api.weather.gov/alerts/active?point={lat},{lon}`

```json
{
  "active_alerts": [
    {
      "event": "Flash Flood Watch",
      "severity": "Moderate",
      "urgency": "Future",
      "headline": "Flash Flood Watch issued March 16...",
      "description": "...",
      "effective": "2026-03-16T12:00:00-04:00",
      "expires": "2026-03-17T06:00:00-04:00"
    }
  ],
  "alert_count": 1
}
```

---

### `get_nws_forecast`
Returns the official NWS narrative forecast for a US location — up to 7 periods (Today, Tonight, Tomorrow, etc.).

- **Input:** `latitude`, `longitude` (US coordinates only)
- **Output:** Office ID + forecast periods with temperature, wind, and human-readable forecast text
- **Source:** `api.weather.gov/points/{lat},{lon}` → NWS forecast URL

```json
{
  "office": "RNK",
  "forecast_periods": [
    {
      "name": "Today",
      "is_daytime": true,
      "temp_f": 72,
      "wind_speed": "20 mph",
      "wind_direction": "S",
      "short_forecast": "Mostly Cloudy then Showers",
      "detailed_forecast": "Showers likely after 2pm. Mostly cloudy, with a high near 72..."
    }
  ]
}
```

---

### `geocoding`
Converts a place name or postal code to coordinates. Use this before calling `weather_forecast` when you only have a location name.

- **Input:** `name` (place name or postal code), optional `count`, `language`, `countryCode`
- **Source:** Open-Meteo geocoding API

---

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["-y", "@kleprevost/weather-mcp"]
    }
  }
}
```

### Other MCP clients

```json
{
  "command": "npx",
  "args": ["-y", "@kleprevost/weather-mcp"]
}
```

### HTTP transport (for remote deployments)

```bash
TRANSPORT=http PORT=3000 npx @kleprevost/weather-mcp
```

Starts an Express server with the MCP endpoint at `/mcp` and a health check at `/health`.

---

## Environment variables

All optional — defaults work out of the box.

| Variable | Default |
|---|---|
| `OPEN_METEO_API_URL` | `https://api.open-meteo.com` |
| `OPEN_METEO_GEOCODING_API_URL` | `https://geocoding-api.open-meteo.com` |
| `WEATHERGOV_API_URL` | `https://api.weather.gov` |
| `TRANSPORT` | `stdio` (set to `http` for HTTP mode) |
| `PORT` | `3000` (HTTP mode only) |

---

## Development

```bash
git clone https://github.com/kleprevost/weather-mcp.git
cd weather-mcp
npm install
npm run dev        # run with auto-reload
npm run build      # compile TypeScript
npm test           # run tests
npm run typecheck  # type check without building
```

### Releasing

```bash
npm run release:patch   # 1.4.0 → 1.4.1
npm run release:minor   # 1.4.0 → 1.5.0
npm run release:major   # 1.4.0 → 2.0.0
# then:
npm publish --access public
```

---

## License

MIT
