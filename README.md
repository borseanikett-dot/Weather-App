# Weather App 🌤️

A modern, responsive weather application built with React and Tailwind CSS. This app provides current weather conditions and 5-day forecasts for any city worldwide.

## Features

- 🌍 **Current Weather**: Real-time weather data for any city
- 📍 **Location-based**: Automatically detects your location (with permission)
- 🔍 **City Search**: Search for weather in any city worldwide
- 📊 **Detailed Information**: Temperature, humidity, wind speed, pressure, and more
- 📅 **5-Day Forecast**: Extended weather predictions
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Beautiful gradient design with glassmorphism effects
- ⚡ **Fast Loading**: Optimized performance with loading states

## Technologies Used

- **React** - Frontend framework
- **Tailwind CSS** - Styling and responsive design
- **Axios** - HTTP client for API requests
- **OpenWeatherMap API** - Weather data source

## Setup Instructions

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your OpenWeatherMap API key**
   - Go to [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key from the dashboard

4. **Add your API key** (Choose one method):

   **Method 1: Environment Variable (Recommended)**
   - Create a `.env` file in the root directory
   - Add: `REACT_APP_WEATHER_API_KEY=your_api_key_here`
   - The app will automatically use this key

   **Method 2: Direct in Code**
   - Open `src/App.js`
   - Replace the API key in the fallback value
   ```javascript
   const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'your_actual_api_key_here';
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Allow location access for automatic weather detection

## Deployment

### Deploy to Netlify (Recommended)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `build` folder
   - Or connect your GitHub repository for automatic deployments

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### Deploy to GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   "scripts": {
     "deploy": "gh-pages -d build"
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

## API Key Security

For production deployment, consider using environment variables:

1. Create a `.env` file in the root directory
2. Add your API key:
   ```
   REACT_APP_WEATHER_API_KEY=your_api_key_here
   ```
3. Update `App.js` to use the environment variable:
   ```javascript
   const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
   ```

## Customization

- **Colors**: Modify the color scheme in `tailwind.config.js`
- **Styling**: Update classes in `src/App.js`
- **Features**: Add more weather data or additional functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ for frontend developers**