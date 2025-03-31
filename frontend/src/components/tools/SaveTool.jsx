import React from "react";
import { FaSave } from "react-icons/fa";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { buttonStyle } from "../styles/toolbarStyles";
export const SaveTool = () => {
  const { canvasRef, backgroundColor } = useWhiteboard();

  const saveCanvasAsImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Create a temporary canvas to include the background
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill the background color
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the actual canvas content on top
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to image
    const dataURL = tempCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "whiteboard.png";
    link.click();
  };

  return (
    <button
      onClick={saveCanvasAsImage}
      style={buttonStyle}
      title="Save drawing"
    >
      <FaSave />
    </button>
  );
};
