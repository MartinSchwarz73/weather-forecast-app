# Weather Forecast App

Simple web application for displaying a 5-day weather forecast.

Live demo:  
https://martinschwarz73.github.io/weather-forecast-app/

## Features

- city search with autocomplete
- weather forecast for selected city
- daily min/max temperatures
- dynamic data from OpenWeather API

## Technologies

- JavaScript (ES6+)
- Object-Oriented Programming (OOP)
- HTML5, CSS3
- OpenWeather API

## Structure

The application is built using an object-oriented approach.

Main responsibilities:
- handling user input (autocomplete)
- fetching data from API
- rendering forecast to the DOM

## Notes

- data are fetched from OpenWeather API
- forecast is aggregated from 3-hour intervals
- dates are formatted using browser locale