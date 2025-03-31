import { useEffect, useState } from "react";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { FaRegCircle } from "react-icons/fa";
import { buttonStyle, selectedButtonStyle } from "../styles/toolbarStyles";

export const CircleTool = () => {
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
    if (!canvasRef.current || selectedTool !== "circle") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const startDrawing = (e) => {
      setStartPos({ x: e.offsetX, y: e.offsetY });
      setIsDrawing(true);
    };

    const stopDrawing = (e) => {
      if (!isDrawing || !startPos) return;
      const { offsetX, offsetY } = e;

      const radius = Math.sqrt(
        Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2)
      );

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "draw",
            action: "circle",
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
      onClick={() => handleToolSelect("circle")}
      title="Circle"
      style={selectedTool === "circle" ? selectedButtonStyle : buttonStyle}
    >
      <FaRegCircle />
    </button>
  );
};
