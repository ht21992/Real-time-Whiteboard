import React, { useEffect } from "react";
import { useWhiteboard } from "../contexts/WhiteboardContext";
import canvasStyle from "./styles/whiteboardStyles";
import { Toolbar } from "./Toolbar";
// import { PencilTool } from "./tools/PencilTool";

const Whiteboard = () => {
  const {
    canvasRef,
    contextRef,
    backgroundColor,
    setBackgroundColor,
    socket,
    setSocket,
    clearCanvas
  } = useWhiteboard();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/whiteboard/");
    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      if (!canvasRef.current) return; // Ensure canvas is available
      const data = JSON.parse(event.data);

      if (data.type === "state") {
        data.drawings.forEach(drawFromServer); // Draw the pervious drawings
        setBackgroundColor(data.background); // Apply saved background
      }

      if (data.type === "draw") {
        drawFromServer(data);
      } else if (data.type === "clear") {
        clearCanvas();
      } else if (data.type === "background") {
        setBackgroundColor(data.color); // Update background in all clients
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return; // Prevent running if canvasRef is not ready

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60;

    if (backgroundColor) {
      canvas.style.backgroundColor = backgroundColor;
    }

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    contextRef.current = ctx;

    // Request stored state only after canvas is set up
    if (socket) {
      socket.send(JSON.stringify({ type: "request_state" }));
    }
  }, [backgroundColor]);

  const drawFromServer = (data) => {
    if (!contextRef.current) return;
    const { x, y, color, lineWidth, action } = data;
    const ctx = contextRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (action === "start") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (action === "drawing") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (action === "stop") {
      ctx.closePath();
    }
  };



  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <Toolbar />
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
};


export default Whiteboard;