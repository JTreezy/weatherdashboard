let weatherAPIKey = "c935a0359a2cd6a6fa89bc669138bd75"
let geocodeAPIKey = "ODNkZTNmM2E0ZjU0NDVhZmE2NGM1ZWM1MDZkZGQ2ZDI6Njg2ZWIwOGMtZTkzNS00Y2ZiLWFlMTktMzE0MTM3NGY4ZThm"


async function searchCityWeather() {
    //converts text string of a city name to populate lon and lat of city to pass through weatherAPI
    let citySearch = $('#city').val()
        
    let locationResponse = await fetch(`https://api.myptv.com/geocoding/v1/locations/by-text?searchText=${citySearch}&apiKey=${geocodeAPIKey}`)
    let locationData = await locationResponse.json()
    let lat = locationData.locations[0].referencePosition.latitude
    let lon = locationData.locations[0].referencePosition.longitude

    //makes a current day weather request
    let weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherAPIKey}`)
    let weatherData = await weatherResponse.json()
    parseResponse(weatherData, citySearch) 
    saveResponse(weatherData, citySearch)
    populateSidebar()
}

function parseResponse(weatherData, citySearch) {
    //variables for current day card population
    let currentCity = citySearch
    let currentDate = moment().format("M/D/Y")
    let currentTemp = weatherData.current.temp
    let currentWindSpeed = weatherData.current.wind_speed
    let currentHumidity = weatherData.current.humidity
    let currentUVI = weatherData.current.uvi
    let currentIMG = weatherData.current.weather[0].icon

    //method to populate current day cards with data variables
    let currentDay = $('#current-day')
    currentDay.find(".place").text(currentCity)
    currentDay.find(".date").text(currentDate)
    currentDay.find(".temp").text(`Temp: ${currentTemp}°F`)
    currentDay.find(".wind").text(`Wind: ${currentWindSpeed} MPH`)
    currentDay.find(".humidity").text(`Humidity: ${currentHumidity}%`)

    //TODO: color the UVI index number background with severity (0-2: Low GREEN, 3-7: Moderate to High YELLOW/ORANGE, 8+: Very High to Extreme RED/PURPLE)
    currentDay.find(".uvi").text(currentUVI)
    if (currentUVI >= 0 && currentUVI < 3) {
        $(".uvi").css("background-color", "green")
    } else if (currentUVI >= 3 && currentUVI < 7) {
        $(".uvi").css("background-color", "orange")
    } else {
        $(".uvi").css("background-color", "red")
    }
    currentDay.find(".icon").html(`<img src="http://openweathermap.org/img/wn/${currentIMG}@2x.png" />`)


    //for loop to populate 5 day forecast cards
    for (let i=0; i < 5; i++) {
        populateDay(i,weatherData.daily[i+1])
    }
    if (citySearch == "") {
        $('main').css("display","none")
    } else {
        $('main').css("display","flex")      
    }
}

function populateDay(offset,data) {
    let date= moment().add(offset + 1, 'days').format("M/D/Y")
    let temp = data.temp.day
    let windSpeed = data.wind_speed
    let humidity = data.humidity
    let img = data.weather[0].icon

    let child = $('#container').children().eq(offset)
    child.find(".date").text(date)
    child.find(".temp").text(`Temp: ${temp}°F`)
    child.find(".wind").text(`Wind: ${windSpeed} MPH`)
    child.find(".humidity").text(`Humidity: ${humidity}%`)
    child.find(".icon").html(`<img src="http://openweathermap.org/img/wn/${img}@2x.png" />`)
}

// TODO: how to store city names as container boxes on the left side in localstorage to populate function again
function saveResponse(weatherData,citySearch) {
    let storedData = localStorage.getItem("cityAndWeatherData")
    if (storedData == null) {
        storedData = {}
    } else {
        storedData = JSON.parse(storedData)
    }
    storedData[citySearch] = weatherData
    storedData = JSON.stringify(storedData)
    localStorage.setItem("cityAndWeatherData", storedData)
}

function populateSidebar() {
    let storedData = localStorage.getItem("cityAndWeatherData")
    if (storedData == null) {
        storedData = {}
    } else {
        storedData = JSON.parse(storedData)
    }
    $('#previous-searches').html("")
    for (const content in storedData) {
        let button = $(`<button>${content}</button>`)
        button.on('click', function () {
            parseResponse(storedData[content], content)
        })
        $('#previous-searches').append(button)
        // console.log(storedData[content])
    }
}


$('#search-button').on('click', async function() {
    await searchCityWeather();
})

populateSidebar()