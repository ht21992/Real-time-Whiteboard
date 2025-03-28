import React from 'react'
import { FaPaintBrush } from "react-icons/fa";
import { selectedButtonStyle ,buttonStyle } from "../../styles/Styles";
export const BrushTool = ({ selectedTool, handleToolSelect }) => {
  return (
    <button
        onClick={() => handleToolSelect("draw")}
        style={selectedTool === "draw" ? selectedButtonStyle : buttonStyle}
      >
        <FaPaintBrush />
    </button>
  )
}
