import React from "react";
import { Board } from "./board/Board";
import { Controller } from "./Controller";

type Props = Readonly<{}>;
export const GameComponent = (props: Props) => {
  return (
    <div>
      <Board boardSize={522} /> <Controller />
    </div>
  );
};
