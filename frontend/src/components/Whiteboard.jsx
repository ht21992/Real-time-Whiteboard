import React, { useEffect, useRef, useState } from "react";
import { FaSave, FaPaintBrush, FaEraser, FaRegTrashAlt } from 'react-icons/fa';

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
        ws.onopen = () => console.log("Connected to WebSocket");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "state"){
                // Draw the pervious drawings
                data.drawings.map((drawing) =>{
                    drawFromServer(drawing);
                })
            }

            if (data.type === "draw") {
                drawFromServer(data);
            } else if (data.type === "clear") {
                clearCanvas();
            }
        };

        ws.onclose = () => console.log("WebSocket disconnected");
        ws.onerror = (error) => console.error("WebSocket error:", error);

        setSocket(ws);

        return () => {
            if (ws.readyState === 1) {
                ws.close();
            }
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 60;
        canvas.style.backgroundColor = backgroundColor;
        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        contextRef.current = ctx;
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
        const dataURL = canvasRef.current.toDataURL();
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "whiteboard.png";
        link.click();
    };

    const handleToolSelect = (tool) => {
        setSelectedTool(tool);
        setIsErasing(tool === 'eraser');
        // console.log(isErasing, "Here");
        // console.log(tool === 'eraser');

    };

    return (
        <div style={{ position: "relative", height: "100vh" }}>
            {/* Toolbar */}
            <div style={toolbarStyle}>
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
                <input type="color" value={backgroundColor}  onChange={(e) => setBackgroundColor(e.target.value)} style={colorPickerStyle} />
            </div>

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

const toolbarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2c3e50",
    padding: "10px",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
};

const buttonStyle = {
    background: "transparent",
    border: "none",
    padding: "10px",
    margin: "0 10px",
    fontSize: "20px",
    color: "#ecf0f1",
    cursor: "pointer",
    transition: "color 0.3s",
};

const selectedButtonStyle = {
    ...buttonStyle,
    color: "#f39c12",
};

const colorPickerStyle = {
    margin: "0 10px",
    cursor: "pointer",
    color:"#fff"
};

const sliderStyle = {
    margin: "0 10px",
};

const canvasStyle = {
    left: 0,
    width: "100%",
    height: "calc(100vh - 60px)",
    cursor: "crosshair",
};

export default Whiteboard;