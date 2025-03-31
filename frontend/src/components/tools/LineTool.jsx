import React from "react";

import { useEffect, useState } from "react";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { FaSlash } from "react-icons/fa";
import { buttonStyle, selectedButtonStyle } from "../styles/toolbarStyles";

export const LineTool = () => {
  const {
    canvasRef,
    isDrawing,
    setIsDrawing,
    color,
    lineWidth,
    socket,
    selectedTool,
    handleToolSelect,
  } = useWhiteboard();

  const [startPos, setStartPos] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || selectedTool !== "line") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const startDrawing = (e) => {
      const { offsetX, offsetY } = e;
      setStartPos({ x: offsetX, y: offsetY });
      setIsDrawing(true);
    };

    const stopDrawing = (e) => {
      if (!isDrawing || !startPos) return;
      const { offsetX, offsetY } = e;

      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "draw",
            action: "line",
            startX: startPos.x,
            startY: startPos.y,
            x: offsetX,
            y: offsetY,
            color,
            lineWidth,
          })
        );
      }

      setIsDrawing(false);
      setStartPos(null);
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", stopDrawing);
    };
  }, [isDrawing, color, lineWidth, selectedTool, socket, startPos]);

  return (
    <button
      onClick={() => handleToolSelect("line")}
      title="Line"
      style={selectedTool === "line" ? selectedButtonStyle : buttonStyle}
    >
      <FaSlash />
    </button>
  );
};
