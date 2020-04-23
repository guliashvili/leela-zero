import * as React from "react";
import { GameComponent } from "./gameComponents/GameComponent";
import GoStateProvider from "../context/GoState";
export class Main extends React.Component<{}, {}> {
  render() {
    return (
      <GoStateProvider>
        <GameComponent />
      </GoStateProvider>
    );
  }
}
