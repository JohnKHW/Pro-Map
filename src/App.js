import React, { useEffect, useState } from "react";
import Heatmap from "./components/Heatmap";
import Camera from "./components/Camera";
import ChartResult from "./components/ChartResult";
import { Col, Container, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import HeatmapComponent from "./components/Heatmap";

const App = () => {
  const [expressions, setExpressions] = useState([]);
  const expressionsTags = [
    "happy",
    "sad",
    "disgusted",
    "fearful",
    "angry",
    "neutral",
    "surprised",
  ];

  const handleOnDetectFace = (newValue) => {
    setExpressions(newValue);
  };

  return (
    <>
      <div className="App">
        <Container>
          <Row>
            <Col>
              <Camera onDetectFace={handleOnDetectFace} fps={5} />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={8}>
              <ChartResult data={expressions} maxLabels={8} />
            </Col>
            <Col>
              <HeatmapComponent data={expressions} keys={expressionsTags} />
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default App;
