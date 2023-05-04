import React, { forwardRef, useEffect, useRef, useState } from "react";
import "./index.css";
import h337 from "heatmap.js";

const HeatmapComponent = (props) => {
  const { keys, data } = props;

  const containerRef = useRef(null);
  const tagRef = useRef(null);
  const tagPos = {};
  const [heatmapInstance, setHeatmapInstance] = useState(null);
  const [oldData, setOldData] = useState([]);

  const radius = 130;

  const Tags = forwardRef(({ keys }, ref) => {
    return (
      <>
        <div
          className="tags"
          style={{ width: "250px", height: "250px" }}
          ref={tagRef}
        >
          {keys.map((key, index) => {
            return (
              <div
                className="tag"
                key={key}
                style={{
                  left: getPosition(key, index).x + "px",
                  top: getPosition(key, index).y + "px",
                }}
              >
                {key}
              </div>
            );
          })}
        </div>
      </>
    );
  });

  const getPositionByValue = (key, value) => {
    const edgePos = tagPos[key];
    if (!edgePos) return { x: 0, y: 0 };

    // center is the value 0, edgePos is the value 1
    const center = getCenter();
    const x = center.x + (edgePos.x - center.x) * value;
    const y = center.y + (edgePos.y - center.y) * value;
    return { x, y };
  };

  const getPosition = (key, index) => {
    //get the position of tags, clockwise from top
    const center = getCenter();
    const angle = (index * 2 * Math.PI) / keys.length;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    tagPos[key] = { x, y };
    return { x, y };
  };

  const getCenter = () => {
    if (containerRef.current === null) return { x: 0, y: 0 };
    const { clientWidth, clientHeight } = containerRef.current;

    return {
      x: clientWidth / 2,
      y: clientHeight / 2,
    };
  };

  const initHeatmap = () => {
    if (containerRef.current === null) return;

    const max = 1;
    const min = 0;
    const radius = 70;

    const config = {
      // only container is required, the rest will be defaults
      container: containerRef.current,
      radius,
      max,
      min,
    };
    // clear containerRef.current childs
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const heatmapInstance = h337.create(config);
    setHeatmapInstance(heatmapInstance);
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

    // const data = { max: max, min, data: points };
    // heatmapInstance.setData(data);
  };

  // draw tags on heatmap
  // const drawTags = () => {
  //   keys.forEach((key) => {
  //     const tag = document.createElement("div");
  //     tag.className = "tag";
  //     tag.innerHTML = key;
  //     const { x, y } = getPosition(key, keys.indexOf(key));
  //     tag.style.left = `${x}px`;
  //     tag.style.top = `${y}px`;
  //     containerRef.current.appendChild(tag);
  //   });
  // };

  useEffect(() => {
    if (!data || data.length === 0) return;

    // filter out all old data from oldData
    const newData = data.filter((item) => {
      const timestamp = item.timestamp;
      const oldItem = oldData.find((item) => item.timestamp === timestamp);
      if (oldItem) return false;
      return true;
    });

    const radius = 70;
    const points = [];

    const max = 1;
    const min = 0;
    newData.forEach((item) => {
      const tags = Object.keys(item);
      // remove timestamp
      tags.splice(tags.indexOf("timestamp"), 1);
      tags.forEach((tag) => {
        const { x, y } = getPositionByValue(tag, item[tag]);
        heatmapInstance.addData({
          x,
          y,
          value: item[tag],
          radius,
        });
      });
    });
    setOldData(data);
    // console.log('points', points);
    const _data = { max, min, data: points };
    // if (heatmapInstance) {
    //   heatmapInstance.setData(_data);
    //   console.log('set data')
    // }
  }, [data]);

  useEffect(() => {
    initHeatmap();
    // drawTags();
  }, []);

  return (
    <>
      <div className="heatmap-container">
        <div className="heatmap" ref={containerRef}></div>
        <Tags keys={keys} ref={containerRef} />
      </div>
    </>
  );
};
export default HeatmapComponent;
