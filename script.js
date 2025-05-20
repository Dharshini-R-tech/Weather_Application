let isFahrenheit = false;
let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities") || "[]");

document.addEventListener("DOMContentLoaded", () => {
    updateDateTime();
    setInterval(updateDateTime, 60000);
    renderFavorites();
    applyDarkMode();
});

function updateDateTime() {
    const now = new Date();
    document.getElementById('datetime').textContent = now.toLocaleString();
}

function toggleUnit() {
    isFahrenheit = !isFahrenheit;
    const city = document.getElementById('cityInput').value;
    if (city) getWeather(city);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function applyDarkMode() {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
}

async function getWeather(city) {
    if (!city) city = document.getElementById('cityInput').value;
    if (!city) return;

    if (!favoriteCities.includes(city)) {
        favoriteCities.push(city);
        localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
        renderFavorites();
    }

    const unitGroup = isFahrenheit ? 'us' : 'metric';
    const apiKey = 'DJLCAF9G5FVE7CZ34S2T53HK9';
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=${unitGroup}&key=${apiKey}&contentType=json`;

    await fetchWeatherData(url);
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const unitGroup = isFahrenheit ? 'us' : 'metric';
            const apiKey = 'DJLCAF9G5FVE7CZ34S2T53HK9';
            const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=${unitGroup}&key=${apiKey}&contentType=json`;

            await fetchWeatherData(url);
        }, () => alert("Geolocation permission denied or unavailable."));
    } else {
        alert("Geolocation not supported.");
    }
}

function renderFavorites() {
    const favDiv = document.getElementById('favorites');
    favDiv.innerHTML = favoriteCities.map(city =>
        `<button onclick="getWeather('${city}')">${city}</button>`
    ).join("");
}

async function fetchWeatherData(url) {
    const resultDiv = document.getElementById('weatherResult');
    const forecastDiv = document.getElementById('forecast');
    resultDiv.innerHTML = 'Loading...';
    forecastDiv.innerHTML = '';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.currentConditions) {
            const current = data.currentConditions;
            const location = data.resolvedAddress;
            const today = data.days[0];
            const iconUrl = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${current.icon}.png`;
            
            changeBackground(current.icon);

            resultDiv.innerHTML = `
                <h2>${location}</h2>
                <img src="${iconUrl}" alt="weather icon" style="width:60px;">
                <p><strong>Temperature:</strong> ${current.temp}°${isFahrenheit ? 'F' : 'C'}</p>
                <p><strong>Feels Like:</strong> ${current.feelslike}°${isFahrenheit ? 'F' : 'C'}</p>
                <p><strong>Conditions:</strong> ${current.conditions}</p>
                <p><strong>Humidity:</strong> ${current.humidity}%</p>
                <p><strong>Air Quality:</strong> ${current.aqi || 'N/A'}</p>
            `;

            forecastDiv.innerHTML = '<h3>5-Day Forecast</h3>';
            data.days.slice(0, 5).forEach(day => {
                const dayIcon = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${day.icon}.png`;
                forecastDiv.innerHTML += `
                    <div style="margin-bottom:10px;">
                        <strong>${new Date(day.datetime).toLocaleDateString()}</strong><br>
                        <img src="${dayIcon}" alt="${day.conditions}" style="vertical-align:middle; width:40px;">
                        <span>${day.temp}°${isFahrenheit ? 'F' : 'C'}</span> - ${day.conditions}
                    </div>
                `;
            });
        } else {
            resultDiv.innerHTML = "<p>Weather data not available.</p>";
        }
    } catch {
        resultDiv.innerHTML = "<p>Error fetching weather data.</p>";
    }
}

function changeBackground(icon) {
    const backgrounds = {
        clear: "#fefcd7",
        cloudy: "#c7c7c7",
        rain: "#a4b0be",
        snow: "#e0f7fa",
        fog: "#b0bec5",
        thunder: "#9fa8da"
    };
    let color = "#ffffff";
    for (let key in backgrounds) {
        if (icon.includes(key)) {
            color = backgrounds[key];
            break;
        }
    }
    document.body.style.background = color;
}
