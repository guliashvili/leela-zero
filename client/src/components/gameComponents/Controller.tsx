import React, { useContext } from "react";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { GoStateContext } from "../../context/GoState";
import { IconButton, TextField } from "@material-ui/core";
import SubtitlesIcon from "@material-ui/icons/Subtitles";
import { BackEndBird } from "../../BackEndBird";
export const Controller = () => {
  const { gameState, dispatch } = useContext(GoStateContext);
  const winningChance = gameState.getCurrentBoardState().analysis
    ?.winningChance;
  return (
    <div>
      <IconButton
        onClick={() => {
          dispatch({ type: "back" });
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <IconButton
        onClick={() => {
          BackEndBird.getNextSuggestedMove(gameState);
        }}
      >
        <SubtitlesIcon />
      </IconButton>
      <IconButton
        onClick={() => {
          dispatch({ type: "forward" });
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
      <TextField
        disabled
        id="standard-disabled"
        label={
          winningChance == null ? "Not Sure" : `${winningChance.toFixed(4)}`
        }
      />
    </div>
  );
};
