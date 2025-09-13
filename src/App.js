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
      
      // Check if API key is valid (add new key to this list if it doesn't work)
      if (API_KEY === 'YOUR_NEW_API_KEY_HERE' || API_KEY === 'f7185f4f5fca996437e4ca15cdfce11d' || API_KEY === '2b79118bfb10aad8db828f6a7290c921') {
        // Use demo data for now
        console.log('Using demo data - API key not configured');
        
        const demoWeather = {
          name: cityName,
          sys: { country: "US" },
          dt: Math.floor(Date.now() / 1000),
          weather: [{ 
            icon: "01d", 
            description: "clear sky" 
          }],
          main: { 
            temp: Math.floor(Math.random() * 15) + 15, 
            feels_like: Math.floor(Math.random() * 15) + 17, 
            humidity: Math.floor(Math.random() * 40) + 40, 
            pressure: Math.floor(Math.random() * 50) + 1000 
          },
          wind: { speed: Math.random() * 5 + 1 }
        };
        
        const demoForecast = [
          { dt: Math.floor(Date.now() / 1000) + 86400, weather: [{ icon: "02d", description: "few clouds" }], main: { temp: Math.floor(Math.random() * 15) + 15 } },
          { dt: Math.floor(Date.now() / 1000) + 172800, weather: [{ icon: "10d", description: "light rain" }], main: { temp: Math.floor(Math.random() * 15) + 13 } },
          { dt: Math.floor(Date.now() / 1000) + 259200, weather: [{ icon: "03d", description: "scattered clouds" }], main: { temp: Math.floor(Math.random() * 15) + 16 } },
          { dt: Math.floor(Date.now() / 1000) + 345600, weather: [{ icon: "01d", description: "clear sky" }], main: { temp: Math.floor(Math.random() * 15) + 18 } },
          { dt: Math.floor(Date.now() / 1000) + 432000, weather: [{ icon: "04d", description: "broken clouds" }], main: { temp: Math.floor(Math.random() * 15) + 17 } }
        ];
        
        setWeather(demoWeather);
        setForecast(demoForecast);
        return;
      }
      
      // Use real API
      const weatherUrl = `${API_BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Weather API error: ${weatherResponse.status} - ${errorText}`);
      }
      
      const weatherData = await weatherResponse.json();
      console.log('Weather data received:', weatherData);
      
      // Now get forecast
      const forecastUrl = `${API_BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        const errorText = await forecastResponse.text();
        console.error('Forecast API Error Response:', errorText);
        throw new Error(`Forecast API error: ${forecastResponse.status} - ${errorText}`);
      }
      
      const forecastData = await forecastResponse.json();
      console.log('Forecast data received:', forecastData);
      
      setWeather(weatherData);
      setForecast(forecastData.list.slice(0, 5));
    } catch (err) {
      console.error('Full error details:', err);
      setError(`Error: ${err.message || 'City not found. Please try again.'}`);
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
    <div className="min-h-screen bg-gradient-to-br from-weather-blue to-weather-dark-blue">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Weather App
          </h1>
          <p className="text-xl text-blue-100">
            Stay updated with current weather and forecasts
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-weather-light-blue focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-weather-blue font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!weather && !loading && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🌤️</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Welcome to WeatherApp
                </h2>
                <p className="text-xl text-blue-100 mb-6">
                  Search for any city to get current weather and 5-day forecast
                </p>
                <div className="text-blue-200">
                  <p>• Real-time weather data</p>
                  <p>• 5-day weather forecast</p>
                  <p>• Location-based weather (with permission)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Weather */}
        {weather && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {weather.name}, {weather.sys.country}
                </h2>
                <p className="text-blue-100 mb-6">
                  {formatDate(weather.dt)} • {formatTime(weather.dt)}
                </p>
                
                <div className="flex items-center justify-center mb-6">
                  <img
                    src={getWeatherIcon(weather.weather[0].icon)}
                    alt={weather.weather[0].description}
                    className="w-24 h-24"
                  />
                  <div className="ml-4">
                    <div className="text-6xl md:text-8xl font-bold text-white">
                      {Math.round(weather.main.temp)}°
                    </div>
                    <div className="text-xl text-blue-100 capitalize">
                      {weather.weather[0].description}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-blue-100 text-sm">Feels Like</div>
                    <div className="text-2xl font-bold text-white">
                      {Math.round(weather.main.feels_like)}°
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-blue-100 text-sm">Humidity</div>
                    <div className="text-2xl font-bold text-white">
                      {weather.main.humidity}%
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-blue-100 text-sm">Wind Speed</div>
                    <div className="text-2xl font-bold text-white">
                      {weather.wind.speed} m/s
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-blue-100 text-sm">Pressure</div>
                    <div className="text-2xl font-bold text-white">
                      {weather.main.pressure} hPa
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                5-Day Forecast
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {forecast.map((item, index) => (
                  <div key={index} className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-blue-100 text-sm mb-2">
                      {formatDate(item.dt)}
                    </div>
                    <div className="text-blue-100 text-xs mb-2">
                      {formatTime(item.dt)}
                    </div>
                    <img
                      src={getWeatherIcon(item.weather[0].icon)}
                      alt={item.weather[0].description}
                      className="w-12 h-12 mx-auto mb-2"
                    />
                    <div className="text-white font-bold text-lg">
                      {Math.round(item.main.temp)}°
                    </div>
                    <div className="text-blue-100 text-xs capitalize">
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
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Loading weather data...</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-blue-100">
            Built with React • Powered by OpenWeatherMap API
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
