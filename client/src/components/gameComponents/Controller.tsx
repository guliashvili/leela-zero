import React, { useContext } from "react";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { GoStateContext } from "../../context/GoState";
import { IconButton } from "@material-ui/core";

type Props = Readonly<{}>;
export const Controller = (props: Props) => {
  const { dispatch } = useContext(GoStateContext);
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
          dispatch({ type: "forward" });
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </div>
  );
};
