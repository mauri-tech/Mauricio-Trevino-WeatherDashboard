const cityList = $("#city-list");
let cities = [];
const apiKey = "628d57f32262d7f6c272be5df6242e8e";

// Format date for display
const formatDate = () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${date.getFullYear()}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
};

// Initialize the dashboard
const init = () => {
  const storedCities = JSON.parse(localStorage.getItem("cities"));

  if (storedCities !== null) {
    cities = storedCities;
  }

  renderCities();
};

// Store cities in localStorage
const storeCities = () => {
  localStorage.setItem("cities", JSON.stringify(cities));
};

// Render cities list
const renderCities = () => {
  cityList.empty();

  for (const city of cities) {
    const listItem = $("<li>").text(city)
      .attr("id", "listC")
      .attr("data-city", city)
      .attr("class", "list-group-item");

    cityList.prepend(listItem);
  }

  if (cities.length > 0) {
    getWeatherData(cities[0]);
  }
};

// Handle add city form submission
$("#add-city").on("click", function (event) {
  event.preventDefault();

  const city = $("#city-input").val().trim();

  if (city === "") {
    return;
  }

  cities.push(city);
  storeCities();
  renderCities();
});

// Fetch and display weather data for a city
const getWeatherData = (cityName) => {
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  $("#today-weather").empty();

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then((response) => {
    // Display city data
    const cityTitle = $("<h3>").text(`${response.name} ${formatDate()}`);
    $("#today-weather").append(cityTitle);

    const temperature = parseInt((response.main.temp) * 9 / 5 - 459);
    const cityTemperature = $("<p>").text(`Temperature: ${temperature} °F`);
    $("#today-weather").append(cityTemperature);

    const cityHumidity = $("<p>").text(`Humidity: ${response.main.humidity} %`);
    $("#today-weather").append(cityHumidity);

    const cityWindSpeed = $("<p>").text(`Wind Speed: ${response.wind.speed} MPH`);
    $("#today-weather").append(cityWindSpeed);

    const coordLon = response.coord.lon;
    const coordLat = response.coord.lat;

    // Fetch and display UV index
    const uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${coordLat}&lon=${coordLon}`;

    $.ajax({
      url: uvQueryURL,
      method: "GET"
    }).then((responseuv) => {
      const uvIndex = $("<span>").text(responseuv.value);
      const uvIndexLabel = $("<p>").text("UV Index: ").append(uvIndex);
      $("#today-weather").append(uvIndexLabel);

      if (responseuv.value > 0 && responseuv.value <= 2) {
        uvIndex.attr("class", "green");
    } else if (responseuv.value > 2 && responseuv.value <= 5) {
      uvIndex.attr("class", "yellow");
    } else if (responseuv.value > 5 && responseuv.value <= 7) {
      uvIndex.attr("class", "orange");
    } else if (responseuv.value > 7 && responseuv.value <= 10) {
      uvIndex.attr("class", "red");
    } else {
      uvIndex.attr("class", "purple");
    }
  });

  // Fetch and display 5-day forecast
  const forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;

  $.ajax({
    url: forecastQueryURL,
    method: "GET"
  }).then((response5day) => {
    $("#boxes").empty();

    for (let i = 0, j = 0; j <= 5; i += 6) {
      const read_date = response5day.list[i].dt;

      if (response5day.list[i].dt !== response5day.list[i + 1].dt) {
        const forecastDiv = $("<div>").attr("class", "col-3 m-2 bg-primary");
        const d = new Date(0);
        d.setUTCSeconds(read_date);

        const date = d;
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const formattedDate = `${date.getFullYear()}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;

        const forecastDate = $("<h6>").text(formattedDate);
        const imgTag = $("<img>");
        const skyConditions = response5day.list[i].weather[0].main;

        if (skyConditions === "Clouds") {
          imgTag.attr("src", "https://img.icons8.com/color/48/000000/cloud.png");
        } else if (skyConditions === "Clear") {
          imgTag.attr("src", "https://img.icons8.com/color/48/000000/summer.png");
        } else if (skyConditions === "Rain") {
          imgTag.attr("src", "https://img.icons8.com/color/48/000000/rain.png");
        }

        const pTemperatureK = response5day.list[i].main.temp;
        const tempInFahrenheit = parseInt((pTemperatureK) * 9 / 5 - 459);
        const pTemperature = $("<p>").text(`Temperature: ${tempInFahrenheit} °F`);
        const pHumidity = $("<p>").text(`Humidity: ${response5day.list[i].main.humidity} %`);

        forecastDiv.append(forecastDate, imgTag, pTemperature, pHumidity);
        $("#boxes").append(forecastDiv);

        j++;
      }
    }
  });
});
};

// Handle city list item click
$(document).on("click", "#listC", function () {
const clickedCity = $(this).attr("data-city");
getWeatherData(clickedCity);
});

// Initialize the weather dashboard
init();
