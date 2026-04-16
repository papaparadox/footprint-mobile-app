const db = require("../database/connect.js");

class Country {
  constructor(id, name, continent, iso_code, flag_url) {
    this.id = id;
    this.name = name;
    this.continent = continent;
    this.iso_code = iso_code;
    this.flag_url = flag_url;
  }

  static async getAll() {
    const result = await db.query(
      "SELECT * FROM countries ORDER BY name ASC"
    );
    if (result.rows.length === 0) {
      throw new Error("No countries found");
    }
    return result.rows.map(
      (row) => new Country(row.id, row.name, row.continent, row.iso_code, row.flag_url)
    );
  }

  static async getById(id) {
    const result = await db.query(
      "SELECT * FROM countries WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Country not found");
    }
    const row = result.rows[0];
    return new Country(row.id, row.name, row.continent, row.iso_code, row.flag_url);
  }

  static async getByIsoCode(iso_code) {
    const result = await db.query(
      "SELECT * FROM countries WHERE iso_code = $1",
      [iso_code]
    );
    if (result.rows.length === 0) {
      throw new Error("Country not found");
    }
    const row = result.rows[0];
    return new Country(row.id, row.name, row.continent, row.iso_code, row.flag_url);
  }

  static async getCitiesByCountry(country_id) {
    const result = await db.query(
      "SELECT * FROM cities WHERE country_id = $1 ORDER BY name ASC",
      [country_id]
    );
    return result.rows;
  }
}

module.exports = Country;