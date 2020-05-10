import React, { useContext, useEffect } from "react";
import { Board } from "./board/Board";
import { Controller } from "./Controller";
import { GoStateContext } from "../../context/GoState";
import { socket } from "../../BackEndBird";

console.log("im here");
export const GameComponent = () => {
  const { dispatch } = useContext(GoStateContext);
  useEffect(() => {
    console.log("sockeet");
    socket.on("live playout", (data) => {
      dispatch({ type: "addSuggestion", ...data });
    });
  });
  return (
    <div>
      <Board boardSize={522} /> <Controller />
    </div>
  );
};
