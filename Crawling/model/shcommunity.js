"use strict";
var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  Model = new Schema({
    //address: String,
    community_name: String,
    community_id: {
      type: 'String',
      index: { unique: true }
    },
    district: String,
    plate: String,
    price: String,
    age: Number,
    url: String,
    lat: Number, 
    lng: Number,
    building_count: Number,
    house_count: Number
  }, {
    versionKey: false
  });
Model.index({
  community_name: 1
});

module.exports = mongoose.model("shcommunity", Model);