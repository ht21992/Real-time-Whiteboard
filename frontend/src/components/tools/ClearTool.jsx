import React from "react";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { FaRegTrashAlt } from "react-icons/fa";
import { buttonStyle } from "../styles/toolbarStyles";

export const ClearTool = () => {
  const { clearCanvas } = useWhiteboard();

  return (
    <button onClick={clearCanvas} style={buttonStyle}>
      <FaRegTrashAlt />
    </button>
  );
};
