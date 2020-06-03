import React, { useContext, useEffect } from "react";
import { Board } from "./board/Board";
import { Controller } from "./Controller";
import { SGFDropZone } from "./SGFDropZone";
import { GoStateContext } from "../../context/GoState";
import { socket } from "../../BackEndBird";

export const GameComponent = () => {
  const { dispatch } = useContext(GoStateContext);
  useEffect(() => {
    socket.on("live playout", (data) => {
      dispatch({ type: "addSuggestion", ...data });
    });
  });
  return (
    <div>
      <Board boardSize={522} /> <Controller /> <SGFDropZone />
    </div>
  );
};
