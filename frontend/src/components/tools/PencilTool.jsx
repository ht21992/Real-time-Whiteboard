import { useEffect } from "react"
import { useWhiteboard } from "../../contexts/WhiteboardContext"
import { FaSave, FaPencilAlt, FaEraser, FaRegTrashAlt } from "react-icons/fa";
import {
  buttonStyle,
  selectedButtonStyle,
} from "../styles/toolbarStyles";
export const PencilTool = () => {

const { canvasRef,
    isDrawing,
    setIsDrawing,
    isErasing,
    color,
    backgroundColor,
    lineWidth,
    socket,
    selectedTool,
    lastPosition,
    setLastPosition,
    handleToolSelect


    } = useWhiteboard()

    useEffect(() => {

    // if (!canvasRef.current || selectedTool !== 'pencil') return;

    if (!canvasRef.current || !['pencil','eraser'].includes(selectedTool)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const startDrawing = (e) => {
        const { offsetX, offsetY } = e;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
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
        const { offsetX, offsetY } = e;
        const { x: prevX, y: prevY } = lastPosition;

        if (prevX !== null && prevY !== null) {
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();

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

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
    };


}, [isDrawing, color, lineWidth, selectedTool, socket]);


  return (<button
    onClick={() => handleToolSelect("pencil")}
    style={selectedTool === "pencil" ? selectedButtonStyle : buttonStyle}
  >
    <FaPencilAlt />
  </button>);
}
