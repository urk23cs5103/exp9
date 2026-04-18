const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

let db;

async function connectDB() {
    await client.connect();
    db = client.db("eventdb");
    console.log("MongoDB Connected");
}
connectDB();

// Registration
app.post("/register", async (req, res) => {

    let { regno, name, events } = req.body;

    if (!events) return res.send("Select at least one event");

    if (!Array.isArray(events)) events = [events];

    if (events.length > 3) {
        return res.send("Maximum 3 events allowed");
    }

    let collection = db.collection("registrations");

    // check duplicate
    let existing = await collection.findOne({ regno });
    if (existing) {
        return res.send("Duplicate Register Number not allowed");
    }

    await collection.insertOne({
        regno,
        name,
        events
    });

    res.send("Registration Successful");
});

// Search
app.get("/search", async (req, res) => {

    let regno = req.query.regno;

    let collection = db.collection("registrations");

    let user = await collection.findOne({ regno });

    if (!user) {
        return res.send("No record found");
    }

    res.send(`
        <h2>Details</h2>
        Register Number: ${user.regno}<br>
        Name: ${user.name}<br>
        Events: ${user.events.join(", ")}
    `);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
