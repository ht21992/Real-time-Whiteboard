import React, { useEffect, useRef, useState } from "react";
import { FaSave, FaPaintBrush, FaEraser, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar } from "./Toolbar";
import { canvasStyle  } from "../styles/Styles";
const Whiteboard = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [color, setColor] = useState("#89CFF0");
    const [lineWidth, setLineWidth] = useState(2);
    const [backgroundColor, setBackgroundColor] = useState("#FAF9F6");
    const [lastPosition, setLastPosition] = useState({ x: null, y: null });
    const [socket, setSocket] = useState(null);
    const [selectedTool, setSelectedTool] = useState('draw');

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/whiteboard/");
        ws.onopen = () => {
            console.log("Connected to WebSocket");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            if (!canvasRef.current) return; // Ensure canvas is available
            const data = JSON.parse(event.data);

            if (data.type === "state"){
                data.drawings.forEach(drawFromServer); // Draw the pervious drawings
                setBackgroundColor(data.background);  // Apply saved background
            }

            if (data.type === "draw") {
                drawFromServer(data);
            } else if (data.type === "clear") {
                clearCanvas();
            }
            else if (data.type === "background") {
                setBackgroundColor(data.color);  // Update background in all clients
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

    const startDrawing = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        setLastPosition({ x: offsetX, y: offsetY });

        if (socket) {
            socket.send(JSON.stringify({
                type: "draw",
                x: offsetX,
                y: offsetY,
                color: isErasing ? backgroundColor : color,
                lineWidth,
                action: "start"
            }));
        }
    };


    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        const { x: prevX, y: prevY } = lastPosition;

        if (prevX !== null && prevY !== null) {
            contextRef.current.lineTo(offsetX, offsetY);
            contextRef.current.stroke();

            if (socket) {
                socket.send(JSON.stringify({
                    type: "draw",
                    x: offsetX,
                    y: offsetY,
                    color: isErasing ? backgroundColor : color,
                    lineWidth,
                    action: "drawing"
                }));
            }
        }

        setLastPosition({ x: offsetX, y: offsetY });
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (socket) {
            socket.send(JSON.stringify({
                type: "draw",
                action: "stop"
            }));
        }
    };

    const drawFromServer = (data) => {
        if (!contextRef.current) return;
        const { x, y, color, lineWidth, action } = data;

        contextRef.current.strokeStyle = color ;
        contextRef.current.lineWidth = lineWidth;

        if (action === "start") {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
        } else if (action === "drawing") {
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (action === "stop") {
            contextRef.current.closePath();
        }
    };

    const clearCanvas = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (socket) {
            socket.send(JSON.stringify({
                type: "clear"
            }));
        }
    };

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

    const handleToolSelect = (tool) => {
        setSelectedTool(tool);
        setIsErasing(tool === 'eraser');

    };

    return (
        <div style={{ position: "relative", height: "100vh" }}>
            {/* Toolbar */}
            {/* <div style={toolbarStyle}>
                <button onClick={() => handleToolSelect('draw')} style={selectedTool === 'draw' ? selectedButtonStyle : buttonStyle}>
                    <FaPaintBrush />
                </button>

                <button onClick={() => handleToolSelect('eraser')} style={selectedTool === 'eraser' ? selectedButtonStyle : buttonStyle}>
                    <FaEraser />
                </button>
                <button onClick={clearCanvas} style={buttonStyle}>
                    <FaRegTrashAlt />
                </button>
                <button onClick={saveCanvasAsImage} style={buttonStyle}>
                    <FaSave />
                </button>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={colorPickerStyle} />
                <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} style={sliderStyle} />
                <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                        const newColor = e.target.value;
                        setBackgroundColor(newColor);

                        if (socket) {
                            socket.send(JSON.stringify({
                                type: "background",
                                color: newColor
                            }));
                        }
                    }}
                    style={colorPickerStyle}
                />
            </div> */}
            <Toolbar selectedTool={selectedTool} handleToolSelect={handleToolSelect} />

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={(e) => {
                    draw(e);
                }}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                style={canvasStyle}
            />
        </div>
    );
};


export default Whiteboard;