import * as React from "react";
import { Board } from "./board/Board";
import GoStateProvider from "../context/GoState";

export class Main extends React.Component<{}, {}> {
  render() {
    return (
      <GoStateProvider>
        <Board boardSize={522} />
      </GoStateProvider>
    );
  }
}
