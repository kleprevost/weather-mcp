# Weather MCP Server

A Model Context Protocol (MCP) server providing weather information from the National Weather Service API. This server implements MCP tools that can be used by AI models to retrieve weather forecasts and alerts.

## What is Model Context Protocol?

The Model Context Protocol (MCP) enables AI models to access external data and services through a standardized interface. This weather MCP server offers AI models the ability to retrieve real-time weather information for locations in the United States.

## Features

- **Weather Alerts**: Get active weather alerts for any US state
- **Weather Forecasts**: Get detailed weather forecasts for any US location by coordinates
- **MCP Compatible**: Implements the Model Context Protocol for easy integration with AI systems

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Running the Server

```bash
npm start
```

## Development

```bash
npm run dev
```

## Tools Available

### get-alerts

Gets active weather alerts for a US state.

Parameters:
- `state`: Two-letter state code (e.g., CA, NY)

### get-forecast

Gets weather forecast for a location.

Parameters:
- `latitude`: Latitude of the location (-90 to 90)
- `longitude`: Longitude of the location (-180 to 180)

## How It Works

This server connects to the National Weather Service (NWS) API to fetch real-time weather data. It communicates using the Model Context Protocol over stdio, allowing AI models to seamlessly access weather information during conversations.

## License

See the [LICENSE](LICENSE) file for details.