const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const filePath = path.join(__dirname, "messages.json");

const readMessages = () => {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
};

const writeMessages = (messages) => {
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
};

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/messages", (req, res) => {
    const { key, message, time } = req.body;

    if (!key || !message || !time) {
        return res.send("All fields are required");
    }

    const messages = readMessages();

    const newMessage = {
        id: Date.now(),
        key,
        message,
        time
    };

    messages.push(newMessage);
    writeMessages(messages);

    res.send("Message saved successfully");
});

app.get("/messages/:key", (req, res) => {
    const key = req.params.key;
    const messages = readMessages();

    const msg = messages.find(m => m.key === key);

    if (!msg) {
        return res.send("Message not found");
    }

    const now = new Date();
    const unlockTime = new Date(msg.time);

    if (now < unlockTime) {
        return res.send("Time is pending");
    }

    res.send(msg.message);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
