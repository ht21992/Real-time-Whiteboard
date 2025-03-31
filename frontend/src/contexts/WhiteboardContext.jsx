import { createContext, useContext, useRef, useState } from "react";

const WhiteboardContext = createContext();

export const WhiteboardProvider = ({ children }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [color, setColor] = useState("#89CFF0");
  const [lineWidth, setLineWidth] = useState(2);
  const [backgroundColor, setBackgroundColor] = useState("#FAF9F6");
  const [lastPosition, setLastPosition] = useState({ x: null, y: null });
  const [socket, setSocket] = useState(null);
  const [selectedTool, setSelectedTool] = useState("pencil");



  const clearCanvas = () => {
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    if (socket) {
      socket.send(
        JSON.stringify({
          type: "clear",
        })
      );
    }
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setIsErasing(tool === 'eraser');
  };

  return (
    <WhiteboardContext.Provider
      value={{
        canvasRef,
        contextRef,
        isDrawing,
        setIsDrawing,
        isErasing,
        setIsErasing,
        color,
        setColor,
        lineWidth,
        setLineWidth,
        backgroundColor,
        setBackgroundColor,
        lastPosition,
        setLastPosition,
        socket,
        setSocket,
        selectedTool,
        setSelectedTool,
        handleToolSelect,
        clearCanvas
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("useWhitebiard must be used whitin a WhiteboardProvider");
  }
  return context;
};
