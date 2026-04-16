const VisitedLocation = require("../models/VisitedLocation");

async function getVisitedByUser(req, res) {
  try {
    const visits = await VisitedLocation.getByUser(req.params.userId);
    res.status(200).json(visits);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createVisit(req, res) {
  try {
    const data = {
      user_id: req.user.id,
      country_id: req.body.country_id,
      city_id: req.body.city_id,
      trip_id: req.body.trip_id,
      date_visited: req.body.date_visited,
      notes: req.body.notes,
    };
    const visit = await VisitedLocation.create(data);
    res.status(201).json(visit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function bulkCreateVisits(req, res) {
  try {
    const { country_ids } = req.body;
    const user_id = req.user.id;
    const visits = await VisitedLocation.bulkCreate(user_id, country_ids);
    res.status(201).json({
      message: `${visits.length} countries logged successfully`,
      visits,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteVisit(req, res) {
  try {
    const deleted = await VisitedLocation.delete(req.params.id, req.user.id);
    res.status(200).json({ message: "Visit deleted", deleted });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

module.exports = { getVisitedByUser, createVisit, bulkCreateVisits, deleteVisit };