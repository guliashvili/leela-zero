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
  const { boardIdentifier, moves } = req.body;
  const data = await axios.post("http://127.0.0.1:1999/json", {
    moves,
    boardIdentifier,
    commandSpec: { command: "z" },
  });

  return res.json(data.data);
});

app.post("/live_data", async function (req, res) {
  const line = req.body.line.trim();
  const boardIdentifier = req.body.boardIdentifier;

  const thinkingRe = /(?:Thinking at most )(.*)(?: seconds)/g;
  const l1 = thinkingRe.exec(line);
  const [, thinking] = l1 == null ? [] : l1;

  const playoutsRe = /(?:Playouts: )(.*)(?:, Win: )(.*)(?:%, PV: )(.*)$/g;
  const l2 = playoutsRe.exec(line);
  let [, playoutsNum, winRatio, moves] = l2 == null ? [] : l2;

  const finalPlayoutsRe = /(?:.* ->    )(.*)(?: \(V: )(.*)(?:%\) \(LCB: .*%\) \(N: .*%\) PV: )(.*)$/g;
  const l3 = finalPlayoutsRe.exec(line);
  const [, playoutsNum2, winRatio2, moves2] = l3 == null ? [] : l3;
  if (playoutsNum == null && winRatio == null && moves == null) {
    playoutsNum = playoutsNum2;
    winRatio = winRatio2;
    moves = moves2;
  }
  console.log({ line, l1, l2, l3 });

  if (thinking != null) {
    io.sockets.emit("live thinking", { boardIdentifier, thinking });
  } else if (playoutsNum != null && winRatio != null && moves != null) {
    const data = {
      boardIdentifier,
      playouts: parseInt(playoutsNum),
      winningChance: parseFloat(winRatio) / 100.0,
      moves: moves.split(" ").map((move) => {
        return {
          y: parseInt(move.substr(1)) - 1,
          x:
            move[0].charCodeAt(0) - "A".charCodeAt(0) - (move[0] > "I" ? 1 : 0),
        };
      }),
    };
    io.sockets.emit("live playout", data);
  }
});

server.listen(port1, () => {
  console.log(`Server listening at port ${port1}`);
});
