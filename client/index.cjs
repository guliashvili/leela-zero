const express = require("express");
const path = require("path");
const axios = require("axios");
const port1 = 80;
const port2 = 9000;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
const server = require("http").createServer(app);
const io = require("socket.io").listen(port2);
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
  const line = req.body.line.trim();

  const thinkingRe = /(?:Thinking at most )(.*)(?: seconds)/g;
  const l1 = thinkingRe.exec(line);
  const [, thinking] = l1 == null ? [] : l1;

  const playoutsRe = /(?:Playouts: )(.*)(?:, Win: )(.*)(?:%, PV: )(.*)$/g;
  const l2 = playoutsRe.exec(line);
  const [, playoutsNum, winRatio, moves] = l2 == null ? [] : l2;

  if (thinking != null) {
    io.sockets.emit("live thinking", { thinking });
  } else if (playoutsNum != null && winRatio != null && moves != null) {
    const data = {
      boardIdentifier: null,
      playouts: parseInt(playoutsNum),
      winningChance: parseFloat(winRatio) / 100.0,
      moves: moves.split(" ").map((move) => {
        return {
          y: move[0].charCodeAt(0) - "A".charCodeAt(0),
          x: move[1].charCodeAt(0) - "1".charCodeAt(0),
        };
      }),
    };
    io.sockets.emit("live playout", data);
  }
});

server.listen(port1, () => {
  console.log(`Server listening at port ${port1}`);
});
