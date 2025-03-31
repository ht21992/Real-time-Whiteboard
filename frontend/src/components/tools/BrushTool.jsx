import React from "react";
import { useEffect } from "react";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { FaPaintBrush } from "react-icons/fa";
import { buttonStyle, selectedButtonStyle } from "../styles/toolbarStyles";

export const BrushTool = () => {
  const {
    canvasRef,
    isDrawing,
    setIsDrawing,
    color,
    lineWidth,
    socket,
    selectedTool,
    lastPosition,
    setLastPosition,
    handleToolSelect,
  } = useWhiteboard();

  useEffect(() => {
    if (!canvasRef.current || selectedTool !== "brush") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.8; // Slight transparency for a softer brush effect

    const startDrawing = (e) => {
      const { offsetX, offsetY } = e;
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.lineWidth = lineWidth * 2; // Slightly thicker for a brush effect
      ctx.strokeStyle = color;
      setIsDrawing(true);
      setLastPosition({ x: offsetX, y: offsetY });

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "draw",
            x: offsetX,
            y: offsetY,
            color,
            lineWidth: lineWidth * 2,
            action: "start",
          })
        );
      }
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const { offsetX, offsetY } = e;
      const { x: prevX, y: prevY } = lastPosition;

      if (prevX !== null && prevY !== null) {
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        if (socket) {
          socket.send(
            JSON.stringify({
              type: "draw",
              x: offsetX,
              y: offsetY,
              color,
              lineWidth: lineWidth * 2,
              action: "brush",
            })
          );
        }
      }

      setLastPosition({ x: offsetX, y: offsetY });
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      if (socket) {
        socket.send(
          JSON.stringify({
            type: "draw",
            action: "stop",
          })
        );
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, [isDrawing, color, lineWidth, selectedTool, socket]);

  return (
    <button
      onClick={() => handleToolSelect("brush")}
      title="Brush"
      style={selectedTool === "brush" ? selectedButtonStyle : buttonStyle}
    >
      <FaPaintBrush />
    </button>
  );
};
