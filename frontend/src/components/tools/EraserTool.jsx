import React from "react";
import { selectedButtonStyle, buttonStyle } from "../../styles/Styles";
import { FaEraser } from "react-icons/fa";
export const EraserTool = ({ selectedTool, handleToolSelect }) => {
  return (
    <button
      onClick={() => handleToolSelect("eraser")}
      style={selectedTool === "eraser" ? selectedButtonStyle : buttonStyle}
    >
      <FaEraser />
    </button>
  );
};
