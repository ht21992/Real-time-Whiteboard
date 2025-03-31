import { FaSprayCan } from "react-icons/fa";
import { useWhiteboard } from "../../contexts/WhiteboardContext";
import { buttonStyle, selectedButtonStyle } from "../styles/toolbarStyles";
import { useEffect } from "react";
export const SprayTool = () => {
  const {
    canvasRef,
    isDrawing,
    setIsDrawing,
    color,
    socket,
    selectedTool,
    handleToolSelect,
  } = useWhiteboard();

  useEffect(() => {
    if (!canvasRef.current || selectedTool !== "spray") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const sprayDensity = 10; // Number of dots per stroke

    const startSpraying = (e) => {
      setIsDrawing(true);
      spray(e);
    };

    const spray = (e) => {
      if (!isDrawing) return;
      const { offsetX, offsetY } = e;

      for (let i = 0; i < sprayDensity; i++) {
        const randomX = offsetX + (Math.random() - 0.5) * 10;
        const randomY = offsetY + (Math.random() - 0.5) * 10;

        ctx.fillStyle = color;
        ctx.fillRect(randomX, randomY, 1.5, 1.5);

        if (socket) {
          socket.send(
            JSON.stringify({
              type: "draw",
              x: randomX,
              y: randomY,
              color,
              action: "spray",
            })
          );
        }
      }
    };

    const stopSpraying = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener("mousedown", startSpraying);
    canvas.addEventListener("mousemove", spray);
    canvas.addEventListener("mouseup", stopSpraying);
    canvas.addEventListener("mouseout", stopSpraying);

    return () => {
      canvas.removeEventListener("mousedown", startSpraying);
      canvas.removeEventListener("mousemove", spray);
      canvas.removeEventListener("mouseup", stopSpraying);
      canvas.removeEventListener("mouseout", stopSpraying);
    };
  }, [isDrawing, color, selectedTool, socket]);
  return (
    <button
      onClick={() => handleToolSelect("spray")}
      title="Spray"
      style={selectedTool === "spray" ? selectedButtonStyle : buttonStyle}
    >
      <FaSprayCan />
    </button>
  );
};
