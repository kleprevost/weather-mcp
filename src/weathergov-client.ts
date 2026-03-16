export interface NWSPointParams {
  latitude: number;
  longitude: number;
}

export interface NWSAlert {
  event: string;
  severity: string;
  urgency: string;
  headline: string;
  description: string;
  effective: string;
  expires: string;
}

export interface NWSAlertsResult {
  active_alerts: NWSAlert[];
  alert_count: number;
}

export interface NWSForecastPeriod {
  name: string;
  is_daytime: boolean;
  temp_f: number;
  wind_speed: string;
  wind_direction: string;
  short_forecast: string;
  detailed_forecast: string;
}

export interface NWSForecastResult {
  office: string;
  forecast_periods: NWSForecastPeriod[];
}

interface AlertFeature {
  properties: {
    event?: string;
    severity?: string;
    urgency?: string;
    headline?: string;
    description?: string;
    effective?: string;
    expires?: string;
  };
}

interface AlertsResponse {
  features: AlertFeature[];
}

interface PointsResponse {
  properties: {
    gridId?: string;
    forecast?: string;
  };
}

interface RawForecastPeriod {
  name?: string;
  isDaytime?: boolean;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
  detailedForecast?: string;
}

interface ForecastResponse {
  properties: {
    periods: RawForecastPeriod[];
  };
}

const ACTIONABLE_KEYWORDS = ['Watch', 'Warning', 'Advisory'];

export class WeatherGovClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string = process.env.WEATHERGOV_API_URL || 'https://api.weather.gov') {
    this.baseURL = baseURL;
    this.headers = {
      'User-Agent': 'Open-Meteo-MCP-Server/1.0.0',
      Accept: 'application/geo+json',
    };
  }

  private async request<T>(url: string): Promise<T> {
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`NWS API error: HTTP ${response.status} for ${url}`);
    }
    return response.json() as Promise<T>;
  }

  async getAlerts(params: NWSPointParams): Promise<NWSAlertsResult> {
    const data = await this.request<AlertsResponse>(
      `${this.baseURL}/alerts/active?point=${params.latitude},${params.longitude}`,
    );

    const features = data.features ?? [];
    const actionable = features.filter((f) => {
      const event = f.properties.event ?? '';
      return ACTIONABLE_KEYWORDS.some((kw) => event.includes(kw));
    });

    const active_alerts: NWSAlert[] = actionable.map((f) => ({
      event: f.properties.event ?? 'Unknown',
      severity: f.properties.severity ?? 'Unknown',
      urgency: f.properties.urgency ?? 'Unknown',
      headline: f.properties.headline ?? '',
      description: f.properties.description ?? '',
      effective: f.properties.effective ?? '',
      expires: f.properties.expires ?? '',
    }));

    return { active_alerts, alert_count: active_alerts.length };
  }

  async getForecast(params: NWSPointParams): Promise<NWSForecastResult> {
    const pointsData = await this.request<PointsResponse>(
      `${this.baseURL}/points/${params.latitude.toFixed(4)},${params.longitude.toFixed(4)}`,
    );

    const office = pointsData.properties?.gridId ?? 'Unknown';
    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      throw new Error('No forecast URL returned from NWS points endpoint');
    }

    const forecastData = await this.request<ForecastResponse>(forecastUrl);
    const periods = forecastData.properties?.periods ?? [];

    const forecast_periods: NWSForecastPeriod[] = periods.slice(0, 7).map((p) => ({
      name: p.name ?? 'Unknown',
      is_daytime: p.isDaytime ?? true,
      temp_f: p.temperature ?? 0,
      wind_speed: p.windSpeed ?? '',
      wind_direction: p.windDirection ?? '',
      short_forecast: p.shortForecast ?? '',
      detailed_forecast: p.detailedForecast ?? '',
    }));

    return { office, forecast_periods };
  }
}
