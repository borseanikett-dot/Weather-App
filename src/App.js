import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '2b79118bfb10aad8db828f6a7290c921';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';


function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user's current location weather on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Don't fetch any weather by default - let user search
          setLoading(false);
        }
      );
    } else {
      // Don't fetch any weather by default - let user search
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching weather for coordinates:', lat, lon);
      
      // Use fetch instead of axios for better CORS handling
      const weatherUrl = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const forecastUrl = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      
      console.log('Weather response:', weatherData);
      setWeather(weatherData);
      setForecast(forecastData.list.slice(0, 5)); // Next 5 forecasts
    } catch (err) {
      console.error('Full error details:', err);
      setError(`Error: ${err.message || 'Failed to fetch weather data'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching weather for:', cityName);
      
      // Use real API
      const weatherUrl = `${API_BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        console.error('API Error Response:', errorData);
        
        if (weatherResponse.status === 404) {
          throw new Error(`City "${cityName}" not found. Please check the spelling and try again.`);
        } else if (weatherResponse.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API configuration.');
        } else if (weatherResponse.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Weather service error: ${weatherResponse.status}. Please try again.`);
        }
      }
      
      const weatherData = await weatherResponse.json();
      console.log('Weather data received:', weatherData);
      
      // Now get forecast
      const forecastUrl = `${API_BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        console.error('Forecast API Error Response:', errorData);
        throw new Error(`Forecast service error: ${forecastResponse.status}. Weather data loaded but forecast unavailable.`);
      }
      
      const forecastData = await forecastResponse.json();
      console.log('Forecast data received:', forecastData);
      
      setWeather(weatherData);
      setForecast(forecastData.list.slice(0, 5));
    } catch (err) {
      console.error('Full error details:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherByCity(city.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && city.trim()) {
      handleSearch(e);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full mb-6 animate-pulse">
            <span className="text-4xl">🌤️</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            WeatherApp
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Discover real-time weather conditions and detailed forecasts for any location worldwide
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for any city..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/10 backdrop-blur-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:bg-white/20 transition-all duration-300 text-lg"
                aria-label="City search input"
                aria-describedby="search-help"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !city.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              aria-label={loading ? "Searching for weather data" : "Search for weather"}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">Searching...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Search</span>
                </div>
              )}
            </button>
          </form>
          <p id="search-help" className="text-blue-200 text-sm mt-3 text-center">
            Press Enter or click search to find weather information
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-red-100 px-6 py-4 rounded-2xl flex items-center animate-pulse">
              <svg className="h-6 w-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium flex-1">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-3 text-red-300 hover:text-red-100 transition-colors"
                aria-label="Dismiss error message"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!weather && !loading && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 mb-12 border border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="text-8xl mb-8 animate-bounce">🌤️</div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Welcome to WeatherApp
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Get instant access to accurate weather information and detailed forecasts for any location around the world
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-200">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="font-medium">Real-time Data</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium">5-Day Forecast</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Location Based</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Weather */}
        {weather && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 mb-12 border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className="text-3xl md:text-4xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {weather.name}, {weather.sys.country}
                  </h2>
                </div>
                <p className="text-blue-100 mb-8 text-lg">
                  {formatDate(weather.dt)} • {formatTime(weather.dt)}
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center mb-8 space-y-6 md:space-y-0 md:space-x-8">
                  <div className="relative">
                    <img
                      src={getWeatherIcon(weather.weather[0].icon)}
                      alt={weather.weather[0].description}
                      className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl animate-pulse"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-lg">☀️</span>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-8xl md:text-9xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      {Math.round(weather.main.temp)}°
                    </div>
                    <div className="text-2xl text-blue-100 capitalize font-medium">
                      {weather.weather[0].description}
                    </div>
                    <div className="text-lg text-blue-200 mt-2">
                      Feels like {Math.round(weather.main.feels_like)}°
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/30">
                    <div className="flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                    <div className="text-blue-100 text-sm font-medium mb-1">Humidity</div>
                    <div className="text-3xl font-bold text-white">
                      {weather.main.humidity}%
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/30">
                    <div className="flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                    <div className="text-blue-100 text-sm font-medium mb-1">Wind Speed</div>
                    <div className="text-xl font-bold text-white">
                      {Math.round(weather.wind.speed * 10) / 10}
                    </div>
                    <div className="text-blue-200 text-xs">m/s</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/30">
                    <div className="flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-blue-100 text-sm font-medium mb-1">Pressure</div>
                    <div className="text-3xl font-bold text-white">
                      {weather.main.pressure} hPa
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/30">
                    <div className="flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-blue-100 text-sm font-medium mb-1">Feels Like</div>
                    <div className="text-3xl font-bold text-white">
                      {Math.round(weather.main.feels_like)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center mb-8">
                <svg className="h-8 w-8 text-blue-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  5-Day Forecast
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {forecast.map((item, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-white/30 group">
                    <div className="text-blue-100 text-sm font-medium mb-3">
                      {formatDate(item.dt)}
                    </div>
                    <div className="text-blue-200 text-xs mb-4">
                      {formatTime(item.dt)}
                    </div>
                    <div className="mb-4">
                      <img
                        src={getWeatherIcon(item.weather[0].icon)}
                        alt={item.weather[0].description}
                        className="w-16 h-16 mx-auto drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-white font-bold text-2xl mb-2">
                      {Math.round(item.main.temp)}°
                    </div>
                    <div className="text-blue-100 text-sm capitalize font-medium">
                      {item.weather[0].description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200/30 border-t-blue-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <div className="text-white text-xl font-medium">Loading weather data...</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-white/20">
          <div className="flex items-center justify-center space-x-2 text-blue-100 mb-4">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">Built with React</span>
            <span>•</span>
            <span>Powered by OpenWeatherMap API</span>
          </div>
          <p className="text-blue-200 text-sm">
            © 2025 WeatherApp - Your trusted weather companion by Aniket
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
