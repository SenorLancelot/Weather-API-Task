# Weather App Documentation

## Overview

This documentation provides an overview of the Weather App's codebase. The Weather App is a simple Express.js application that allows users to manage locations and retrieve weather information, including current weather and historical weather data.

## Table of Contents

1. [Dependencies](#dependencies)
2. [Setup](#setup)
3. [API Endpoints](#api-endpoints)
   - [Create Location](#create-location)
   - [Get All Locations](#get-all-locations)
   - [Get Location by ID](#get-location-by-id)
   - [Update Location](#update-location)
   - [Delete Location](#delete-location)
   - [Get Current Weather](#get-current-weather)
   - [Get Historical Weather](#get-historical-weather)
4. [Error Handling](#error-handling)

## Dependencies

The Weather App relies on several npm packages to function:

- **express**: A web application framework for Node.js.
- **body-parser**: Middleware for parsing incoming request bodies.
- **axios**: A promise-based HTTP client for making requests.
- **redis**: A Node.js Redis client for interacting with a Redis database.
- **sequelize**: An ORM for interacting with databases.
- **dotenv**: Loads environment variables from a `.env` file.

## Setup

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Create a `.env` file with the following environment variables:

   ```plaintext
   API_KEY=your_openweathermap_api_key
   ```

4. Run the application using `npm start`.

## API Endpoints

### Create Location

- **URL:** `/locations`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "name": "CityName",
    "latitude": 40.7128,
    "longitude": -74.006
  }
  ```

- **Response:**

  ```json
  {
    "id": 1,
    "name": "CityName",
    "latitude": 40.7128,
    "longitude": -74.006,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

### Get All Locations

- **URL:** `/locations`
- **Method:** `GET`
- **Response:**

  ```json
  [
    {
      "id": 1,
      "name": "CityName1",
      "latitude": 40.7128,
      "longitude": -74.006,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    {
      "id": 2,
      "name": "CityName2",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    // ...
  ]
  ```

### Get Location by ID

- **URL:** `/locations/:location_id`
- **Method:** `GET`
- **Response:**

  ```json
  {
    "id": 1,
    "name": "CityName",
    "latitude": 40.7128,
    "longitude": -74.006,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

### Update Location

- **URL:** `/locations/:location_id`
- **Method:** `PUT`
- **Request Body:**

  ```json
  {
    "name": "UpdatedCityName",
    "latitude": 41.8781,
    "longitude": -87.6298
  }
  ```

- **Response:**

  ```json
  {
    "id": 1,
    "name": "UpdatedCityName",
    "latitude": 41.8781,
    "longitude": -87.6298,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

### Delete Location

- **URL:** `/locations/:location_id`
- **Method:** `DELETE`
- **Response:** `204 No Content`

### Get Current Weather

- **URL:** `/weather/:location_id`
- **Method:** `GET`
- **Response:**

  ```json
  {
    "temperature": 293.15,
    "humidity": 50,
    "wind_speed": 5.1
  }
  ```

### Get Historical Weather

- **URL:** `/history/:location_id`
- **Method:** `GET`
- **Query Parameters:**
  - `days`: Number of days for historical data
- **Response:**

  ```json
  // Historical weather data
  ```

## Error Handling

The application handles errors and provides meaningful error responses. If an error occurs, the server responds with a JSON object containing the error message.

Example:

```json
{
  "error": "Location not found"
}
```

Additionally, there is a global error handler middleware that logs the error stack and responds with a generic error message when an unhandled error occurs.
