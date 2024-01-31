const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const redis = require("redis");
const { Sequelize, DataTypes } = require("sequelize");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

// Define express app
const app = express();
const port = 3000;

app.use(bodyParser.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "weather.db",
});

let redisClient;

const connectRedis = async () => {
  redisClient = await redis
    .createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();
};

connectRedis();

const Location = sequelize.define("Location", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

sequelize.sync();

app.post("/locations", async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    const location = await Location.create({ name, latitude, longitude });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app
  .route("/locations/:location_id")
  .get(async (req, res) => {
    const { location_id } = req.params;
    try {
      const location = await Location.findByPk(location_id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .put(async (req, res) => {
    const { location_id } = req.params;
    try {
      const [updated] = await Location.update(req.body, {
        where: { id: location_id },
      });
      if (!updated) {
        return res.status(404).json({ error: "Location not found" });
      }
      const updatedLocation = await Location.findByPk(location_id);
      res.json(updatedLocation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .delete(async (req, res) => {
    const { location_id } = req.params;
    try {
      const deletedCount = await Location.destroy({
        where: { id: location_id },
      });
      if (!deletedCount) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.get("/weather/:location_id", async (req, res) => {
  const { location_id } = req.params;
  try {
    const location = await Location.findByPk(location_id);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.API_KEY}`
    );

    const { main, wind, humidity } = weatherResponse.data;

    const forecast = {
      temperature: main.temp,
      humidity: humidity,
      wind_speed: wind.speed,
    };

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/history/:location_id", async (req, res) => {
  const { location_id } = req.params;
  const { days } = req.query;

  try {
    const location = await Location.findByPk(location_id);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    const cacheKey = `history:${location_id}:${days}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("data found");
      const historicalData = JSON.parse(cachedData);
      res.json(historicalData);
    } else {
      console.log("making api call");
      const historyResponse = await axios.get(
        `http://history.openweathermap.org/data/2.5/history/city?lat=${
          location.latitude
        }&lon=${location.longitude}&type=hour&start=${Math.floor(
          (new Date() - days * 24 * 60 * 60 * 1000) / 1000
        )}&appid=${process.env.API_KEY}`
      );
      console.log(historyResponse);

      redisClient.set(cacheKey, JSON.stringify(historyResponse.data), {
        EX: 60 * 60 * 24,
      });
      await redisClient.disconnect();
      res.json(historyResponse.data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
