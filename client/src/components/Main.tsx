import React from "react";
import { GameComponent } from "./gameComponents/GameComponent";
import SettingsStateProvider from "../context/SettingsState";
import GoStateProvider from "../context/GoState";

export const Main = (): JSX.Element => {
  return (
    <SettingsStateProvider>
      <GoStateProvider>
        <GameComponent />
      </GoStateProvider>
    </SettingsStateProvider>
  );
};
