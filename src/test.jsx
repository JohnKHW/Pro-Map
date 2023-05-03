import React, { useRef, useEffect } from "react";
// import "./RadialHeatmap.css";

interface ColorPattern {
  color: string;
  value: number;
}

interface Props {
  keys: string[];
  threshold: ColorPattern[];
  value: any;
}

const RadialHeatmap: React.FC<Props> = ({ keys, threshold, value }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // TODO: Implement the rendering of the radial heatmap based on the given props.
  }, [canvasRef, keys, threshold, value]);

  return <canvas ref={canvasRef} className="radial-heatmap" />;
};

export default RadialHeatmap;
