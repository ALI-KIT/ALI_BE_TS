/*
import React from "react";
import ReactDOM from "react-dom";
import ReactWordcloud from "react-wordcloud";
import { Resizable } from "re-resizable";

import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

import words from "./words";

const resizeStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  background: "#fefefe"
};

const options = {
  colors: [
    "#ffd4ca",
    "#033f63",
    "#28666e",
    "#7c9885",
    "#b5b682",
    "#5c0029",
    "#61304b",
    "#f61067",
    "#896978",
  ],
  rotations: 2,
  rotationAngles: [0, 0],
  fontWeight: "600",
  fontFamily: "sans-serif",
  fontSize: [10, 16],
  padding: 2,
  deterministic: true
};

function App() {
  return (
    <div>
      <p>Resize the container!</p>
      <Resizable
        defaultSize={{
          width: 600,
          height: 300
        }}
        style={resizeStyle}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <ReactWordcloud words={words} options={options} />
        </div>
      </Resizable>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

*/