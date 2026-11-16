const h1City = document.getElementById("city-name");
const mainTemp = document.getElementById("temp");
const wind = document.getElementById("wind");
const form = document.getElementById("search-form");
const weatherDesc = document.getElementById("weather");
const humidity = document.getElementById("humidity");
const cloudy = document.getElementById("cloudy");
const tempMax = document.getElementById("temp-max");
const tempMin = document.getElementById("temp-min");
const timeDisplay = document.getElementById("time");
const weatherIcon = document.getElementById("weather-icon");

function weatherapi(city) {
  let myPromise = new Promise(function (resolve, reject) {
    let http = new XMLHttpRequest();
    let api = `https://api.weatherapi.com/v1/current.json?key=c8ced2d4f4a741e597a174639260106&q=${city}&aqi=no`;

    http.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(JSON.parse(this.responseText));
        } else {
          reject("Error fetching weather data");
        }
      }
    };

    http.open("GET", api);
    http.send();
  });

  myPromise
    .then((response) => {
      h1City.textContent = response.location.name;
      mainTemp.textContent = `${response.current.temp_c}°`;
      wind.textContent = `${response.current.wind_kph}km/h`;
      weatherDesc.textContent = response.current.condition.text.toUpperCase();
      humidity.textContent = `${response.current.humidity}%`;
      cloudy.textContent = `${response.current.cloud}%`;
      tempMax.textContent = `${response.current.temp_c}°`;
      tempMin.textContent = `${response.current.temp_c}°`;
      weatherIcon.src = response.current.condition.icon;

      let date = new Date(response.location.localtime);
      timeDisplay.textContent =
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
        " - " +
        date.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        });

      console.log(response);
    })
    .catch((error) => console.error(error));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let city = e.target.city.value;
  console.log(city);
  weatherapi(city);
});


weatherapi("london")