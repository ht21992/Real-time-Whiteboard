import { useEffect, useState } from "react";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { FaSquareFull } from "react-icons/fa";
import { buttonStyle, selectedButtonStyle } from "../styles/toolbarStyles";

export const RectangleTool = () => {
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
    if (!canvasRef.current || selectedTool !== "rectangle") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const startDrawing = (e) => {
      setStartPos({ x: e.offsetX, y: e.offsetY });
      setIsDrawing(true);
    };

    const stopDrawing = (e) => {
      if (!isDrawing || !startPos) return;
      const { offsetX, offsetY } = e;

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        offsetX - startPos.x,
        offsetY - startPos.y
      );

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "draw",
            action: "rectangle",
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
      onClick={() => handleToolSelect("rectangle")}
      title="Rectangle"
      style={selectedTool === "rectangle" ? selectedButtonStyle : buttonStyle}
    >
      <FaSquareFull />
    </button>
  );
};
