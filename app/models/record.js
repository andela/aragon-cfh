/**
 * Module dependencies.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
/**
 * Game Record Schema
 */
const RecordSchema = new Schema({
  gameID: String,
  players: [],
  rounds: Number,
  winner: String,
  email: String
});

module.exports = mongoose.model('Record', RecordSchema);
