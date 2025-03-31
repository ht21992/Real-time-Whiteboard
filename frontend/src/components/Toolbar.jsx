import React from "react";
import { useWhiteboard } from "../contexts/WhiteboardContext";

import {
  toolbarStyle,
  colorPickerStyle,
  sliderStyle,
} from "./styles/toolbarStyles";
import { PencilTool } from "./tools/PencilTool";
import { EraserTool } from "./tools/EraserTool";
import { ClearTool } from "./tools/ClearTool";
import { SaveTool } from "./tools/SaveTool";
import { BrushTool } from "./tools/BrushTool";
import { SprayTool } from "./tools/SprayTool";
import { LineTool } from "./tools/LineTool";
import { CircleTool } from "./tools/CircleTool";
import { RectangleTool } from "./tools/RectangleTool";

export const Toolbar = () => {
  const {
    color,
    setColor,
    lineWidth,
    setLineWidth,
    backgroundColor,
    setBackgroundColor,
    socket,
  } = useWhiteboard();

  const handleBackgroundChange = (e) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);

    if (socket) {
      socket.send(
        JSON.stringify({
          type: "background",
          color: newColor,
        })
      );
    }
  };

  return (
    <div style={toolbarStyle}>
      <PencilTool />
      <BrushTool />
      <SprayTool />
      <LineTool />
      <RectangleTool />
      <CircleTool />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={colorPickerStyle}
      />
      <input
        type="range"
        min="1"
        max="10"
        value={lineWidth}
        onChange={(e) => setLineWidth(e.target.value)}
        style={sliderStyle}
      />
      <input
        type="color"
        value={backgroundColor}
        onChange={handleBackgroundChange}
        style={colorPickerStyle}
      />
      <div style={{ marginLeft: "auto", display: "flex" }}>
        <EraserTool />
        <ClearTool />
        <SaveTool />
      </div>
    </div>
  );
};
