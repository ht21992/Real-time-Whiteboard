
import React, { useEffect, useRef, useState } from "react";
import { FaSave, FaPaintBrush, FaEraser, FaRegTrashAlt, FaPalette } from 'react-icons/fa';

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);  // To toggle between drawing and erasing
    const [color, setColor] = useState("#000000");
    const [lineWidth, setLineWidth] = useState(2);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [lastPosition, setLastPosition] = useState({ x: null, y: null });
    const [socket, setSocket] = useState(null);
    const [drawings, setDrawings] = useState([]);  // To keep track of all the drawings
    const [selectedTool, setSelectedTool] = useState('draw');  // To track selected tool

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/whiteboard/");
        ws.onopen = () => console.log("Connected to WebSocket");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "draw") {
                drawFromServer(data);
            } else if (data.type === "clear") {
                clearCanvas();
            } else if (data.type === "state") {
                setDrawings(data.drawings);  // Restore previous drawings for new users
            }
        };

        ws.onclose = () => console.log("WebSocket disconnected");
        ws.onerror = (error) => console.error("WebSocket error:", error);

        setSocket(ws);

        return () => ws.close();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        canvas.style.border = "1px solid #ddd";
        canvas.style.backgroundColor = backgroundColor;

        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        contextRef.current = ctx;

        // Draw all previous drawings when the component mounts (for User B)
        drawings.forEach((drawing) => {
            contextRef.current.strokeStyle = drawing.color;
            contextRef.current.lineWidth = drawing.lineWidth;
            contextRef.current.beginPath();
            contextRef.current.moveTo(drawing.points[0].x, drawing.points[0].y);
            drawing.points.forEach((point) => {
                contextRef.current.lineTo(point.x, point.y);
            });
            contextRef.current.stroke();
        });
    }, [backgroundColor, drawings]);

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
                color,
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
                    color,
                    lineWidth,
                    action: "drawing"
                }));
            }
        }

        setLastPosition({ x: offsetX, y: offsetY });
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
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
        contextRef.current.strokeStyle = color;
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

    const handleColorChange = (e) => {
        setColor(e.target.value);
    };

    const handleLineWidthChange = (e) => {
        setLineWidth(e.target.value);
    };

    const handleBackgroundChange = (e) => {
        setBackgroundColor(e.target.value);
    };

    const clearCanvas = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setDrawings([]);  // Reset drawings in the state

        if (socket) {
            socket.send(JSON.stringify({
                type: "clear"
            }));
        }
    };

    const saveCanvasAsImage = () => {
        const dataURL = canvasRef.current.toDataURL();
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "whiteboard.png";
        link.click();
    };

    const startErasing = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isErasing) {
            contextRef.current.clearRect(offsetX - 10, offsetY - 10, 20, 20); // Erase around the cursor
            if (socket) {
                socket.send(JSON.stringify({
                    type: "erase",
                    x: offsetX,
                    y: offsetY
                }));
            }
        }
    };

    const handleToolSelect = (tool) => {
        setSelectedTool(tool);
        if (tool === 'eraser') {
            setIsErasing(true);
        } else {
            setIsErasing(false);
        }
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>Real-time Whiteboard</h2>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: '15px' }}>
                <button
                    onClick={() => handleToolSelect('draw')}
                    style={selectedTool === 'draw' ? selectedButtonStyle : buttonStyle}
                    title="Draw"
                >
                    <FaPaintBrush />
                </button>
                <button
                    onClick={() => handleToolSelect('eraser')}
                    style={selectedTool === 'eraser' ? selectedButtonStyle : buttonStyle}
                    title="Eraser"
                >
                    <FaEraser />
                </button>
                <button onClick={clearCanvas} style={buttonStyle} title="Clear Canvas">
                    <FaRegTrashAlt />
                </button>
                <button onClick={saveCanvasAsImage} style={buttonStyle} title="Save Image">
                    <FaSave />
                </button>
                <input type="color" value={color} onChange={handleColorChange} style={inputStyle} title="Pick Color" />
                <input type="range" min="1" max="10" value={lineWidth} onChange={handleLineWidthChange} style={inputStyle} title="Line Width" />
                <input type="color" value={backgroundColor} onChange={handleBackgroundChange} style={inputStyle} title="Background Color" />
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={(e) => {
                    draw(e);
                    startErasing(e);  // Erase when moving with the eraser
                }}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                style={{ border: "1px solid #ddd", cursor: "crosshair", backgroundColor: backgroundColor, display: "block", margin: "0 auto" }}
            />
        </div>
    );
};

const buttonStyle = {
    background: "#f0f0f0",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    transition: "background 0.3s",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)"
};

const selectedButtonStyle = {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    transition: "background 0.3s",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)"
};

const inputStyle = {
    margin: "5px",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
};

export default Whiteboard;