import React, { useState } from "react";
import "./index.css";

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

const Heatmap: React.FC<Props> = ({
  keys,
  threshold,
  value,
  onValueChange,
}) => {
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedValue, setDraggedValue] = useState("");

  const handleMouseDown = (event: React.MouseEvent, valueKey: string) => {
    setDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setDraggedValue(valueKey);
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDragStart({ x: 0, y: 0 });
    setDraggedValue("");
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (dragging && draggedValue) {
      const { clientX, clientY } = event;
      const diffX = clientX - dragStart.x;
      const diffY = clientY - dragStart.y;
      const angle = Math.atan2(diffY, diffX);
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
      const newValue = Math.max(0, Math.min(1, distance / 100));
      const newValueObj = { ...value, [draggedValue]: newValue };
      onValueChange(newValueObj);
    }
  };

  const renderKeyTags = () => {
    const circumference = 300;
    const radius = circumference / (2 * Math.PI);
    const anglePerKey = (2 * Math.PI) / keys.length;
    return keys.map((key, index) => {
      const angle = index * anglePerKey;
      const x = Math.cos(angle) * radius + radius;
      const y = Math.sin(angle) * radius + radius;
      return (
        <div
          key={key}
          className="heatmap-key"
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          {key}
        </div>
      );
    });
  };

  const renderThresholdGradient = () => {
    const sortedThresholds = [...threshold].sort((a, b) => b.value - a.value);
    return (
      <div className="heatmap-gradient">
        {sortedThresholds.map(({ color, value }, index) => {
          console.log(color, value);
          return (
            <div
              key={index}
              className="heatmap-gradient-stop"
              style={{
                background: color,
                left: `${(1 - value) * 100}%`,
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderValueCircle = () => {
    const circumference = 300;
    const radius = circumference / (2 * Math.PI);
    const valueCircumference = 2 * Math.PI * value["neutral"];
    const valueRadius = value["neutral"] * radius;
    return (
      <svg
        className="heatmap-circle"
        width="100%"
        height="100%"
        viewBox="0 0 300 300"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <circle
          className="heatmap-circle-background"
          cx={radius}
          cy={radius}
          r={radius}
        />
        {keys.map((key, index) => {
          const anglePerKey = (2 * Math.PI) / keys.length;
          const angle = index * anglePerKey - Math.PI / 2;
          // const _value = Math.max(
          //   0,
          //   Math.min(1, (this.props.value[key] || 0) * 2)
          // );
          const x = Math.cos(angle) * valueRadius + radius;
          const y = Math.sin(angle) * valueRadius + radius;
          const isActive = dragging && key === draggedValue;
          return (
            <g key={key}>
              <circle
                className="heatmap-circle-value"
                cx={x}
                cy={y}
                r={isActive ? 12 : 8}
                fill={`url(#${key}-gradient)`}
                onMouseDown={(event) => handleMouseDown(event, key)}
              />
              <defs>
                <radialGradient
                  id={`${key}-gradient`}
                  r="50%"
                  cx="50%"
                  cy="50%"
                >
                  {threshold.map(({ color, value }, index) => (
                    <stop
                      key={index}
                      offset={value}
                      stopColor={color}
                      stopOpacity="1"
                    />
                  ))}
                </radialGradient>
              </defs>
            </g>
          );
        })}
        <circle
          className="heatmap-circle-value-mask"
          cx={radius}
          cy={radius}
          r={valueRadius}
        />
      </svg>
    );
  };

  return (
    <div className="heatmap-container">
      {renderKeyTags()}
      {renderThresholdGradient()}
      {renderValueCircle()}
    </div>
  );
};
export default Heatmap;
