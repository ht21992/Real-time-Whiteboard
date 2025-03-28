import React from "react";

export const SprayTool = () => {
  const spray = (e) => {
    if (!isSpraying) return;
    const ctx = contextRef.current;
    const { offsetX, offsetY } = e.nativeEvent;

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 10;
      const x = offsetX + radius * Math.cos(angle);
      const y = offsetY + radius * Math.sin(angle);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  };
  return <div>SprayTool</div>;
};
