const apiKey = '740e1f980c91788a43d6638bf2836a20';

const getCityCoordinates = async (cityname) => {
    const baseUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=';
    const url = `${baseUrl}${cityname}&appid=${apiKey}`;
    const result = await axios.get(url);
    const cities = result.data;
    const city = cities[0];
    if (!city) {
        console.warn('We cannot find this city.');
        return;
    }
    return [city.lat, city.lon];
};

const testCityCoordinates = async () => {
    const result = await getCityCoordinates('rome');
    if (result[0] !== 41.8933203 || result[1] !== 12.4829321) {
        console.warn('testCityCoordinates fails');
    }
};

testCityCoordinates();

const kelvinToCelsius = (kelvin) => Math.round(kelvin - 273.15);

const getCityWeather = async (cityname) => {
    const [lat, lon] = await getCityCoordinates(cityname);
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const result = await axios.get(url);
    const data = result.data;

    // city information
    const city = data.city;

    // forecasts
    const forecasts = data.list;
    displayCurrentForecast(forecasts[9]);

    const futureDatesToDisplay = 5;
    for (let day = 1; day < futureDatesToDisplay + 1; day++) {
        displayFutureForecast(forecasts[0 + day * 8], day);
    }
    return true;
};

const displayCurrentForecast = (forecast) => {
    const forecastHtml = document.getElementById('forecast-fields');

    const date = new Date(forecast.dt_txt);

    const htmlDate = document.getElementById('main-date');
    htmlDate.innerHTML = date.toLocaleDateString();

    const mainTemperature = document.getElementById('main-temperature');
    mainTemperature.innerHTML = kelvinToCelsius(forecast.main.temp) + ' C';

    const mainHumidity = document.getElementById('main-humidity');
    mainHumidity.innerHTML = forecast.main.humidity + ' %';

    const windSpeed = document.getElementById('wind-speed');
    windSpeed.innerHTML = forecast.wind.speed + ' MPH';

    forecastHtml.classList.remove('hide');
};

const displayFutureForecast = (forecast, day) => {
    const forecastHtml = document.getElementById(`day-${day}-forecast`);

    const date = new Date(forecast.dt_txt);
    const htmlDate = document.getElementById(`day-${day}-date`);
    htmlDate.innerHTML = date.toLocaleString();

    const temperature = document.getElementById(`day-${day}-temperature`);
    temperature.innerHTML = kelvinToCelsius(forecast.main.temp) + ' C';

    const humidity = document.getElementById(`day-${day}-humidity`);
    humidity.innerHTML = forecast.main.humidity + ' %';

    const windSpeed = document.getElementById(`day-${day}-wind-speed`);
    windSpeed.innerHTML = forecast.wind.speed + ' MPH';

    forecastHtml.classList.remove('hide');
};

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loading = document.getElementById('loading');

searchButton.addEventListener('click', async () => {
    const nameOfTheCity = searchInput.value;

    addCityToLocalStorage(nameOfTheCity);
    await getCityWeather(nameOfTheCity);
});

const getFromLocalStorage = (key) => {
    const fromStorage = localStorage.getItem(key);
    try {
        const result = JSON.parse(fromStorage);
        return result;
    } catch (error) {
        console.warn(error);
        return null;
    }
};
const searchedCitiesKey = 'searched-cities';

const addCityToLocalStorage = (nameOfTheCity) => {
    const fromStorage = localStorage.getItem(searchedCitiesKey);
    try {
        const cities = JSON.parse(fromStorage);
        const newCities = [...cities, nameOfTheCity];
        localStorage.setItem(searchedCitiesKey, JSON.stringify(newCities));
        updateSearchedCities(newCities);
    } catch {
        localStorage.setItem(
            searchedCitiesKey,
            JSON.stringify([nameOfTheCity])
        );
        updateSearchedCities([nameOfTheCity]);
    }
};

const clearChildren = (element) => {
    while (element.firstChild) element.removeChild(element.lastChild);
};

const updateSearchedCities = (cities) => {
    const searchedCities = document.getElementById('searched-cities');
    clearChildren(searchedCities);
    for (const city of cities) {
        const p = document.createElement('p');
        p.innerHTML = city;
        p.addEventListener('click', async () => {
            const nameOfTheCity = city;
            await getCityWeather(nameOfTheCity);
        });
        searchedCities.appendChild(p);
    }
};

const onStart = () => {
    const cities = getFromLocalStorage(searchedCitiesKey);
    if (cities === null) return;
    updateSearchedCities(cities);
};

onStart();
