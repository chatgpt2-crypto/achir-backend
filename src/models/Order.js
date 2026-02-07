const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({

name: {
type: String,
required: true
},

phone: {
type: String,
required: true
},

city: {
type: String,
required: true
},

service: {
type: String,
default: "كراء معدات"
},

note: {
type: String,
default: ""
},

status: {
type: String,
default: "pending"
},

createdAt: {
type: Date,
default: Date.now
}

});

module.exports = mongoose.model("Order", OrderSchema);
