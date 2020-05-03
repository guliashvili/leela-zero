import React, { createContext, useReducer } from "react";
import produce, { Draft } from "immer";
export type Action = Readonly<{
  type: "recommendationLoadStatus";
  status: "Loading" | "Done";
}>;
type State = {
  pendingRecommendations: number;
};
const reducer = produce((draft: Draft<State>, action: Action) => {
  switch (action.type) {
    case "recommendationLoadStatus":
      draft.pendingRecommendations +=
        action.status.localeCompare("Loading") === 0 ? 1 : -1;
      break;
  }
});

const initialState = {
  pendingRecommendations: 0,
};
type GoStateContextProps = {
  settings: State;
  dispatch(action: Action): void;
};
export const SettingsStateContext = createContext<GoStateContextProps>({
  settings: initialState,
  dispatch(action: Action): void {
    return;
  },
});

type SettingsStateProviderProps = { children?: React.ReactNode };

const SettingsStateProvider: React.FC<{}> = ({
  children,
}: SettingsStateProviderProps) => {
  const [gameState, dispatch] = useReducer(reducer, initialState);

  return (
    // @ts-ignore
    <SettingsStateContext.Provider value={{ gameState, dispatch }}>
      {children}
    </SettingsStateContext.Provider>
  );
};

export default SettingsStateProvider;
