import React, { useEffect, useState } from "react";
import Heatmap from "./components/Heatmap";
import Camera from "./components/Camera";
import ChartResult from "./components/ChartResult";
import { Col, Container, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import HeatmapComponent from "./components/Heatmap";

const App = () => {
  const [expressions, setExpressions] = useState([]);

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
            <Col>
              <ChartResult data={expressions} maxLabels={8} />
            </Col>
            <Col>
              <HeatmapComponent />
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default App;
