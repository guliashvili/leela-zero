const express = require("express");
const path = require("path");
const axios = require("axios");
const port = process.env.PORT || 80;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.post("/suggested_move", async function (req, res) {
  const gameHistory = req.body;
  console.log("givi history", gameHistory);
  const data = await axios.post("http://127.0.0.1:1999/json", {
    moves: gameHistory["moves"],
    commandSpec: { command: "z" },
  });

  console.log("givi1 data", data.data);
  return res.json(data.data);
});

app.post("/live_data", async function (req, res) {
  const body = req.body;
  io.broadcast.emit(body);
  // console.log("givi live data body", body);
});

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
