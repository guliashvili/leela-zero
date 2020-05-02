import React, { useContext, useEffect } from "react";
import { Board } from "./board/Board";
import { Controller } from "./Controller";
import { GoStateContext } from "../../context/GoState";
import openSocket from "socket.io-client";

export const GameComponent = () => {
  const { gameState, dispatch } = useContext(GoStateContext);
  useEffect(() => {
    const socket = openSocket("http://localhost:9000");
    socket.on("live playout", (data) => {
      // console.log("got it ", data);
      dispatch({ type: "addSuggestion", ...data });
      console.log("after add suggestion", data, gameState);
    });
  });
  return (
    <div>
      <Board boardSize={522} /> <Controller />
    </div>
  );
};
