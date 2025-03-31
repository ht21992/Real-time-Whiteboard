import React from "react";
import { WhiteboardProvider } from "./contexts/WhiteboardContext";
import Whiteboard from "./components/whiteboard";

const App = () => {
  return (
    <WhiteboardProvider>
      <Whiteboard />
    </WhiteboardProvider>
  );
};

export default App;
