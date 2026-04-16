const Country = require("../models/Country");

async function getAllCountries(req, res) {
  try {
    const countries = await Country.getAll();
    res.status(200).json(countries);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getCountryById(req, res) {
  try {
    const country = await Country.getById(req.params.id);
    res.status(200).json(country);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getCitiesByCountry(req, res) {
  try {
    const cities = await Country.getCitiesByCountry(req.params.id);
    res.status(200).json(cities);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

module.exports = { getAllCountries, getCountryById, getCitiesByCountry };