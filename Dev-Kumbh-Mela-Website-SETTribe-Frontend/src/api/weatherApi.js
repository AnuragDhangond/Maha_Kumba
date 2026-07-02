import axios from 'axios';

/**
 * Open-Meteo Weather Code Mapping
 */
const weatherCodes = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snowfall',
  73: 'Moderate Snowfall',
  75: 'Heavy Snowfall',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm',
};

// Default coordinates for Nashik (as seen in dashboard)
const DEFAULT_LAT = 19.9975;
const DEFAULT_LON = 73.7898;

export const fetchRealWeather = async (lat = DEFAULT_LAT, lon = DEFAULT_LON) => {
  try {
    const [weatherRes, airRes] = await Promise.all([
      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=sunrise,sunset,uv_index_max&timezone=Asia%2FKolkata`),
      axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`)
    ]);

    const { current, daily } = weatherRes.data;
    const air = airRes.data.current;

    // Map US AQI to human readable status
    let aqiStatus = 'Good';
    if (air.us_aqi > 50) aqiStatus = 'Moderate';
    if (air.us_aqi > 100) aqiStatus = 'Unhealthy for Sensitive Groups';
    if (air.us_aqi > 150) aqiStatus = 'Unhealthy';
    if (air.us_aqi > 200) aqiStatus = 'Very Unhealthy';

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      condition: weatherCodes[current.weather_code] || 'Clear',
      isDay: current.is_day,
      sunrise: daily.sunrise[0].split('T')[1],
      sunset: daily.sunset[0].split('T')[1],
      uvIndex: daily.uv_index_max[0],
      airQuality: aqiStatus,
      aqiValue: air.us_aqi,
      recordedAt: new Date().toISOString(),
      source: 'Open-Meteo'
    };
  } catch (error) {
    console.error("Failed to fetch from Open-Meteo:", error);
    throw error;
  }
};
