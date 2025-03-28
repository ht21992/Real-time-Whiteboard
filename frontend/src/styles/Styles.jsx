
const toolbarStyle = {
    display: "flex",
    background: "#2c3e50",
    padding: "10px",
    position: "fixed",
    alignItems: "center",
    top: 0,
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


export {toolbarStyle, buttonStyle,selectedButtonStyle,colorPickerStyle,sliderStyle,canvasStyle};