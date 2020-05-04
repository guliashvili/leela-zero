import React from "react";
import { GameComponent } from "./gameComponents/GameComponent";
import GoStateProvider from "../context/GoState";

export const Main = (): JSX.Element => {
  return (
    <GoStateProvider>
      <GameComponent />
    </GoStateProvider>
  );
};
