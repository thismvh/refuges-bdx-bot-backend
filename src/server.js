require('dotenv').config();

const serverless = require("serverless-http");

const mongoose = require("mongoose");
const Refuge = require("./models/refuge");

const MONGO_DB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@refuges-bdx-bot.cnu1y.mongodb.net/refuges-bdx-bot?retryWrites=true&w=majority`

const express = require("express");
const Reservation = require('./models/reservation');
const app = express();
const router = express.Router();

app.use(express.json())

const port = process.env.PORT || 3000
mongoose.connect(MONGO_DB_URI)
  .then(() => app.listen(port, () => console.log(`Listening on port ${port}`)))
  .catch((err) => console.log(err))

router.get("/", (req, res) => {
  res.send("Hello World!")
})

router.get("/refuges/:name", (req, res) => {
  const filter = { name: req.params.name }
  Refuge.findOne(filter)
    .then((updatedRefuge) => {
      console.log()
      res.send(updatedRefuge)
    })
    .catch((err) => res.send(err))
})

router.post("/refuges", (req, res) => {
  console.log(req.body)
  const refuge = new Refuge(req.body)

  refuge.save()
    .then((newRefuge) => res.send(newRefuge))
    .catch((err) => res.send(err))
})

router.patch("/refuges/:name", async (req, res) => {
  console.log(req.body)
  const filter = { name: req.params.name };
  const update = req.body;

  if(update.reservation !== undefined) {
    var newReservation = await new Reservation(update.reservation);
    await newReservation.save();
    update.reservation = newReservation;
  }
  
  Refuge.findOneAndUpdate(filter, update, { new: true, upsert: true })
    .then((updatedRefuge) => {
      console.log()
      res.send(updatedRefuge)
    })
    .catch((err) => res.send(err))
})

router.get("/all-refuges", (req, res) => {
  Refuge.find()
    .then((allRefuges) => res.send(allRefuges))
    .catch((err) => console.log(err))
})

app.use("/.netlify/functions/server", router)

module.exports.handler = serverless(app);