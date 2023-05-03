import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import h337 from "heatmap.js";

interface ColorPattern {
  color: string;
  value: number;
}

interface Props {
  keys: string[];
  threshold: ColorPattern[];
  value: { [key: string]: number };
  onValueChange: (value: { [key: string]: number }) => void;
}

const HeatmapComponent: React.FC<Props> = ({
  keys,
  threshold,
  value,
  onValueChange,
}) => {
  const containerRef = useRef(null);

  const initHeatmap = () => {
    if (containerRef.current === null) return;
    const config = {
      // only container is required, the rest will be defaults
      container: containerRef.current,
    };
    const heatmapInstance = h337.create(config);
    console.log(heatmapInstance);
    const radius = 70;
    const points = [
      {
        x: 100,
        y: 100,
        value: 0.2,
        radius,
      },
      {
        x: 120,
        y: 100,
        value: 1,
        radius,
      },
      {
        x: 120,
        y: 120,
        value: 0.4,
        radius,
      },
    ];
    const max = 1;
    var min = 0;

    const data = { max: max, min, data: points };
    heatmapInstance.setData(data);
  };

  useEffect(() => {
    initHeatmap();
  }, []);

  return (
    <>
      <div className="heatmap-container">
        <div
          className="heatmap"
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        ></div>
      </div>
    </>
  );
};
export default HeatmapComponent;
