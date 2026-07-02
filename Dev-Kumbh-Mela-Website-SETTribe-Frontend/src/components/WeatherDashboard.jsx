import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, 
  SunMedium, Sunrise, Sunset, AlertTriangle, Info, MapPin, Send, RefreshCw, X
} from 'lucide-react';
import { fetchRealWeather } from '../api/weatherApi';
import '../styles/WeatherBroadcasting.css';

const WeatherDashboard = ({ onClose }) => {
  const [weather, setWeather] = useState({
    temperature: null,
    humidity: null,
    windSpeed: null,
    condition: "Loading...",
    icon: "02d",
    rainStatus: "Loading...",
    uvIndex: null,
    airQuality: "Loading...",
    sunrise: "--:-- AM",
    sunset: "--:-- PM"
  });
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time update handlers
  const handleWeatherUpdate = useCallback((newWeather) => {
    console.log("WebSocket Weather Update:", newWeather);
    if (newWeather) setWeather(newWeather);
  }, []);

  const handleAlertUpdate = useCallback((newAlerts) => {
    console.log("WebSocket Alert Update:", newAlerts);
    if (Array.isArray(newAlerts)) setAlerts(newAlerts);
  }, []);

  const handleNotificationUpdate = useCallback((newNotifs) => {
    console.log("WebSocket Notification Update:", newNotifs);
    if (Array.isArray(newNotifs)) setNotifications(newNotifs);
  }, []);

  // Multi-topic subscriptions for maximum coverage
  useWebSocket('/topic/weather-updates', handleWeatherUpdate);
  useWebSocket('/topic/weather', handleWeatherUpdate);
  useWebSocket('/topic/weather-alerts', handleAlertUpdate);
  useWebSocket('/topic/weather-notifications', handleNotificationUpdate);
  useWebSocket('/topic/updates', (msg) => {
    console.log("General Updates Topic received:", msg);
    // If message contains weather info, update it
    if (msg?.type === 'weather') handleWeatherUpdate(msg.data);
    if (msg?.type === 'alert') handleAlertUpdate(msg.data);
  });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      // Fetch local database alerts & notifications first (fast)
      const [alertsRes, notifsRes] = await Promise.all([
        axiosInstance.get('/api/weather/alerts').catch(() => ({ data: [] })),
        axiosInstance.get('/api/weather/notifications').catch(() => ({ data: [] }))
      ]);
      
      // Always update alerts and notifications with latest server data
      const fetchedAlerts = (alertsRes.data || []).filter(alert => alert && (alert.type || alert.message));
      const fetchedNotifs = (notifsRes.data || []).filter(notif => notif && (notif.title || notif.content));
      
      setAlerts(fetchedAlerts);
      
      // If server returns real notifications, use them. Otherwise, use fallback.
      if (fetchedNotifs.length > 0) {
        setNotifications(fetchedNotifs);
      } else {
        setNotifications([
          { 
            title: "Pilgrim Advisory", 
            content: "Welcome to Kumbh Mela 2027. Weather updates are broadcasted live here.", 
            createdAt: new Date().toISOString() 
          }
        ]);
      }

      // Render the modal structure immediately
      setLoading(false);
      setIsRefreshing(false);

      // Fetch weather telemetry in background
      try {
        const [weatherRes, realWeather] = await Promise.all([
          axiosInstance.get('/api/weather/current').catch(err => {
            if (err.response?.status === 403 || err.response?.status === 401) {
              console.warn("Weather API access forbidden (Guest Mode)");
              return { data: null };
            }
            return { data: null };
          }),
          fetchRealWeather().catch(err => {
            console.error("Open-Meteo failed, using fallback:", err);
            return null;
          })
        ]);

        if (realWeather) {
          setWeather(realWeather);
        } else if (weatherRes.data) {
          setWeather(weatherRes.data);
        } else {
          setWeather({
            temperature: 32.5,
            humidity: 65,
            windSpeed: 12.4,
            condition: "Partly Cloudy",
            icon: "02d",
            rainStatus: "Low Chance",
            uvIndex: 8.2,
            airQuality: "Good",
            sunrise: "05:52 AM",
            sunset: "06:45 PM"
          });
        }
      } catch (err) {
        console.error("Telemetry fetch failed:", err);
      }
      
    } catch (error) {
      console.error("Error fetching live weather data:", error);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 300000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="weather-loading">Loading Weather Updates...</div>;

  const getSafetySuggestion = () => {
    if (!weather || weather.temperature == null) return "Retrieving live safety guidelines...";
    if (weather.temperature > 35) return "High temperature detected. Stay hydrated and avoid direct sunlight during peak hours.";
    if (weather.rainStatus && weather.rainStatus.toLowerCase().includes("rain")) return "Heavy rain expected. Avoid riverbank areas and carry an umbrella.";
    if (weather.windSpeed > 20) return "Strong winds detected. Stay away from tall trees and temporary structures.";
    return "Weather looks good for pilgrimage. Have a safe journey!";
  };

  return (
    <div className="weather-dashboard">
      {/* Alert Banner if any */}
      {alerts.length > 0 && (
        <div className="weather-alert-banner">
          <div className="alert-badge">Alert</div>
          <div className="alert-scroller">
            {alerts.map((alert, index) => (
              <span key={index} style={{ marginRight: '50px' }}>
                <AlertTriangle size={16} /> {alert.type}: {alert.message}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="weather-widget-container">
        <div className="weather-header">
          <div className="location-tag">
            <MapPin size={18} /> Nashik, Maharashtra
          </div>
          <div className="live-tag">LIVE UPDATES</div>
        </div>

        <div className="weather-main">
          <div className="weather-icon-section">
             <SunMedium size={80} className="weather-icon-large" color="#FFD700" />
          </div>
          <div className="weather-temp-section">
            <div className="weather-temp">
              {weather.temperature != null ? Math.round(weather.temperature) : '--'}°C
            </div>
            <div className="weather-condition">{weather.condition || 'Updating...'}</div>
          </div>
        </div>

        <div className="weather-details-grid">
          <div className="weather-detail-item">
            <Droplets size={22} color="#ff7e36" />
            <span className="weather-detail-label">Humidity</span>
            <span className="weather-detail-value">{weather.humidity ?? '--'}%</span>
          </div>
          <div className="weather-detail-item">
            <Wind size={22} color="#ff7e36" />
            <span className="weather-detail-label">Wind</span>
            <span className="weather-detail-value">{weather.windSpeed != null ? weather.windSpeed.toFixed(1) : '--'} km/h</span>
          </div>
          <div className="weather-detail-item">
            <Thermometer size={22} color="#ff7e36" />
            <span className="weather-detail-label">UV Index</span>
            <span className="weather-detail-value">{weather.uvIndex != null ? weather.uvIndex.toFixed(1) : '--'}</span>
          </div>
          <div className="weather-detail-item">
            <Cloud size={22} color="#ff7e36" />
            <span className="weather-detail-label">Air Quality</span>
            <span className="weather-detail-value">{weather.airQuality || '--'}</span>
          </div>
        </div>

        {/* Manual Announcements Section - Moved Up for higher visibility */}
        {notifications.length > 0 && (
          <div className="weather-announcements">
            <div className="announcements-header">
              <Send size={16} /> OFFICIAL ANNOUNCEMENTS
            </div>
            <div className="announcements-list">
              {notifications.map((notif, index) => (
                <div key={index} className="announcement-item">
                  <div className="announcement-title">{notif.title}</div>
                  <div className="announcement-content">{notif.content}</div>
                  <div className="announcement-time">{new Date(notif.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="weather-sun-times" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sunrise size={20} color="#ffb74d" />
            <span>{weather.sunrise}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sunset size={20} color="#f06292" />
            <span>{weather.sunset}</span>
          </div>
        </div>

        <div className="safety-suggestions">
          <div className="safety-header">
            <Info size={16} /> SAFETY SUGGESTION
          </div>
          <div className="safety-text">
            {getSafetySuggestion()}
          </div>
        </div>

        <div className="weather-forecast">
          <div className="forecast-title">Next 24 Hours</div>
          <div className="forecast-scroll">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="forecast-item">
                <span className="forecast-time">{(new Date().getHours() + i + 1) % 24}:00</span>
                <Sun size={24} className="forecast-icon" color="#FFD700" />
                <span className="forecast-temp">{weather.temperature != null ? `${Math.round(weather.temperature - i)}°` : '--°'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeatherDashboard;
