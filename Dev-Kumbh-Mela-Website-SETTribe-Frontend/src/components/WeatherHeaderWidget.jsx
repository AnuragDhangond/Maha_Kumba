import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axiosInstance from '../api/axiosConfig';
import { useWebSocket } from '../hooks/useWebSocket';
import { Sun, Cloud, CloudRain, CloudLightning, X } from 'lucide-react';
import { fetchRealWeather } from '../api/weatherApi';
import { useTranslation } from 'react-i18next';
import WeatherDashboard from './WeatherDashboard';
import '../styles/WeatherBroadcasting.css';

const WeatherHeaderWidget = () => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);

  // Real-time update handlers
  const handleWeatherUpdate = useCallback((newWeather) => {
    if (newWeather) setWeather(newWeather);
  }, []);

  const handleAlertUpdate = useCallback((newAlerts) => {
    if (Array.isArray(newAlerts)) setAlerts(newAlerts);
  }, []);

  // WebSocket subscriptions
  useWebSocket('/topic/weather-updates', handleWeatherUpdate);
  useWebSocket('/topic/weather-alerts', handleAlertUpdate);

  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, alertsRes, realWeather] = await Promise.all([
          axiosInstance.get('/api/weather/current').catch(err => {
            if (err.response?.status === 403 || err.response?.status === 401) {
              return { data: null };
            }
            throw err;
          }),
          axiosInstance.get('/api/weather/alerts').catch(() => ({ data: [] })),
          fetchRealWeather().catch(() => null)
        ]);

        if (realWeather) {
          setWeather(realWeather);
        } else if (weatherRes.data) {
          setWeather(weatherRes.data);
        } else {
          setWeather({ temperature: 32, condition: 'Clear' });
        }
        setAlerts(alertsRes.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeather({ temperature: 32, condition: 'Clear' });
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const renderDropdown = () => {
    if (!isPopupOpen || !triggerRef.current) return null;

    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 480;
    
    const dropdownStyle = isMobile ? {
      position: 'fixed',
      top: `${rect.bottom + 10}px`,
      right: '10px',
      left: '10px',
      width: 'auto',
      maxWidth: 'none'
    } : {
      position: 'fixed',
      top: `${rect.bottom + 10}px`,
      left: `${rect.right - 420}px`, // Align to right of trigger
      width: '420px'
    };

    return createPortal(
      <div 
        className="weather-dropdown-container" 
        ref={popupRef}
        style={{ ...dropdownStyle, zIndex: 999999 }}
      >
        <div className="weather-dropdown-arrow" style={!isMobile ? { left: 'auto', right: '15px' } : { display: 'none' }}></div>
        <div className="weather-dropdown-header">
          <h3>{t('weather.title', 'Live Weather')}</h3>
          <button className="close-dropdown" onClick={() => setIsPopupOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="weather-dropdown-body">
          <WeatherDashboard onClose={() => setIsPopupOpen(false)} />
        </div>
      </div>,
      document.body
    );
  };

  if (!weather) return null;

  return (
    <div className="weather-header-wrapper">
      <div 
        ref={triggerRef}
        className={`weather-header-widget-trigger ${isPopupOpen ? 'active' : ''}`}
        onClick={() => setIsPopupOpen(!isPopupOpen)}
      >
        <div className="weather-icon-wrapper">
          {getWeatherIcon(weather.condition)}
          {alerts.length > 0 && <span className="weather-alert-dot"></span>}
        </div>
      </div>

      {renderDropdown()}
    </div>
  );
};

const getWeatherIcon = (condition, size = 24) => {
  return <Cloud size={size} color="#2196f3" />;
};


export default WeatherHeaderWidget;
