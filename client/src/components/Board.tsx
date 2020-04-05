import React, { useRef, useEffect } from "react";

export class Board extends React.Component {
  canvasRef = useRef<HTMLCanvasElement>(null);
  componentDidMount() {
    return;
  }
  render() {
    return (
      <div>
        <canvas ref={this.canvasRef} width={640} height={425} />
      </div>
    );
  }
}
