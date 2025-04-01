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
    clearCanvas,
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
    }else if (action === "eraser_start") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    else if (action === "eraser_draw") {
      const prevComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalCompositeOperation = prevComposite;
    }
    else if (action === "pencil" || action === "brush") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (action === "spray") {
      const sprayDensity = 10; // Number of dots per stroke
      for (let i = 0; i < sprayDensity; i++) {
        const randomX = x + (Math.random() - 0.5) * 10;
        const randomY = y + (Math.random() - 0.5) * 10;
        ctx.fillStyle = color;
        ctx.fillRect(randomX, randomY, 1.5, 1.5);
      }
    } else if (action === "line") {
      ctx.beginPath();
      ctx.moveTo(data.startX, data.startY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();
    } else if (action === "rectangle") {
      ctx.strokeRect(
        data.startX,
        data.startY,
        x - data.startX,
        y - data.startY
      );
    } else if (action === "circle") {
      const radius = Math.sqrt(
        Math.pow(x - data.startX, 2) + Math.pow(y - data.startY, 2)
      );
      ctx.beginPath();
      ctx.arc(data.startX, data.startY, radius, 0, 2 * Math.PI);
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
