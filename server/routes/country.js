const { Router } = require("express");
const { getAllCountries, getCountryById, getCitiesByCountry } = require("../controllers/country");
const authenticator = require("../middleware/authenticator");

const countryRouter = Router();

countryRouter.get("/", authenticator, getAllCountries);
countryRouter.get("/:id", authenticator, getCountryById);
countryRouter.get("/:id/cities", authenticator, getCitiesByCountry);

module.exports = countryRouter;