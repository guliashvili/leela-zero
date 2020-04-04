const express = require("express");
const path = require("path");
const axios = require("axios");
const port = process.env.PORT || 80;

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.post("/suggested_move", async function (req, res) {
  const gameHistory = req.body;
  console.log("givi history", gameHistory);
  const data = await axios.post("http://127.0.0.1:1999/json", {
    moves: gameHistory["moves"],
    commandSpec: { command: "z" },
  });

  console.log("givi data", data.data);
  return res.json(data.data);
});

const server = require("http").createServer(app);

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
