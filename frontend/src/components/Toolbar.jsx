import React from "react";
import { BrushTool } from "./tools/BrushTool";
import { EraserTool } from "./tools/EraserTool";
import { toolbarStyle } from "../styles/Styles";
export const Toolbar = ({ selectedTool, handleToolSelect }) => {
  return (
    <div style={toolbarStyle}>
      <BrushTool selectedTool={selectedTool} handleToolSelect={handleToolSelect} />
      <EraserTool selectedTool={selectedTool} handleToolSelect={handleToolSelect} />
    </div>
  );
};

