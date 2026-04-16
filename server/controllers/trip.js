const Trip = require("../models/Trip");

async function getTripsByUser(req, res) {
  try {
    const trips = await Trip.getByUser(req.params.userId);
    res.status(200).json(trips);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getTripById(req, res) {
  try {
    const trip = await Trip.getById(req.params.id);
    res.status(200).json(trip);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getTripByToken(req, res) {
  try {
    const trip = await Trip.getByToken(req.params.token);
    res.status(200).json(trip);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createTrip(req, res) {
  try {
    const data = {
      user_id: req.user.id,
      title: req.body.title,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      total_days: req.body.total_days,
      notes: req.body.notes,
      mood: req.body.mood,
    };
    const trip = await Trip.create(data);
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function addImage(req, res) {
  try {
    const image = await Trip.addImage(
      req.params.id,
      req.body.image_url,
      req.body.caption
    );
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteTrip(req, res) {
  try {
    const deleted = await Trip.delete(req.params.id, req.user.id);
    res.status(200).json({ message: "Trip deleted", deleted });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

module.exports = { getTripsByUser, getTripById, getTripByToken, createTrip, addImage, deleteTrip };