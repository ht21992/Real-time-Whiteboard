import React from "react";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { FaEraser } from "react-icons/fa";
import { buttonStyle, selectedButtonStyle } from "../styles/toolbarStyles";
export const EraserTool = () => {
  const { selectedTool, handleToolSelect } = useWhiteboard();

  return (
    <button
      onClick={() => handleToolSelect("eraser")}
      title="Eraser"
      style={selectedTool === "eraser" ? selectedButtonStyle : buttonStyle}
    >
      <FaEraser />
    </button>
  );
};
