const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');
const newsContainer = document.querySelector('.news-list'); // News container

const weatherApiKey = ''; // OpenWeather API Key
const newsApiKey = ''; // NewsAPI Key

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
    }
});

async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${weatherApiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

async function getNewsData(city) {
    const apiUrl = `https://newsapi.org/v2/everything?q=${city}&apiKey=${newsApiKey}`;
    const response = await fetch(apiUrl);
    return response.json();
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);
    if (weatherData.cod != 200) {
        alert('City not found!');
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + ' °C';
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + '%';
    windValueTxt.textContent = speed + ' M/s';

    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
    currentDateTxt.textContent = getCurrentDate();

    weatherInfoSection.style.display = 'block';

    await updateForecastsInfo(city);
    await updateNewsInfo(city);
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);
        }
    });
}

function updateForecastItems(weatherData) {
    const { dt_txt: date, weather: [{ id }], main: { temp } } = weatherData;
    const dateTaken = new Date(date);
    const dateResult = dateTaken.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    const forecastItem = `
        <div class="forecast-item">
            <h5>${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}">
            <h5>${Math.round(temp)} °C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

async function updateNewsInfo(city) {
    const newsData = await getNewsData(city);
    newsContainer.innerHTML = newsData.articles.slice(0, 5).map(article =>
        `<div class="news-item"><h4>${article.title}</h4><p>${article.description || 'No description available.'}</p>
        <a href="${article.url}" target="_blank">Read more</a></div>`).join('');
}

function getWeatherIcon(id) {
    return id < 800 ? 'clouds.svg' : 'clear.svg';
}

function getCurrentDate() {
    return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}
