import React, { useEffect, useRef, useState } from "react";

import * as faceapi from "face-api.js";

import "./index.css";
import { Button, Col, Row } from "react-bootstrap";

const Camera = (props) => {
  const { onDetectFace, fps = 24 } = props;

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);

  const [expression, setExpression] = useState([]);

  const videoRef = useRef(null);
  const videoHeight = 240;
  const videoWidth = 320;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (modelsLoaded) {
      console.log("model is loaded");
    }
  }, [modelsLoaded]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      console.log("MODEL_URL", MODEL_URL);

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (onDetectFace != null) {
      onDetectFace(expression);
    }
  }, [expression, onDetectFace]);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
          videoRef.current
        );
        const displaySize = {
          width: videoWidth,
          height: videoHeight,
        };

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const rawDetections = faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        ); // Raw detection result. Can't see any useful data by inspection.
        const rawLandmarks = await rawDetections; // Meaningful coordinates. Easy to mirror. Cannot be chained to get further landmarks.
        const detections = await rawDetections
          .withFaceLandmarks()
          .withFaceExpressions()
          .withFaceDescriptors(); // Works only with raw detection result.
        if (detections.length > 0) {
          await detections.forEach(({ expressions }) => {
            const record = {
              timestamp: new Date().getTime(),
              ...expressions,
            };
            setExpression((prev) => [...prev, record]);
          });
        }

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        canvasRef &&
          canvasRef.current &&
          canvasRef.current
            .getContext("2d")
            .clearRect(0, 0, videoWidth, videoHeight);
        // canvasRef &&
        //   canvasRef.current &&
        //   faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        // canvasRef &&
        //   canvasRef.current &&
        //   faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        // canvasRef &&
        //   canvasRef.current &&
        //   faceapi.draw.drawFaceExpressions(
        //     canvasRef.current,
        //     resizedDetections
        //   );
      }
    }, 1000 / fps);
  };

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  };

  const resetData = () => {
    setExpression([]);
  };

  return (
    <>
      <div style={{ textAlign: "center", padding: "10px" }}>
        <Row>
          <Col xs={5}>
            <Button onClick={resetData} variant="outline-danger">
              Reset
            </Button>
          </Col>
          <Col>
            {captureVideo && modelsLoaded ? (
              <Button onClick={closeWebcam} variant="outline-success">
                Close Webcam
              </Button>
            ) : (
              <Button onClick={startVideo} variant="outline-success">
                Open Webcam
              </Button>
            )}
          </Col>
        </Row>
      </div>
      {captureVideo ? (
        modelsLoaded ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "10px",
              }}
            >
              <video
                ref={videoRef}
                height={videoHeight}
                width={videoWidth}
                onPlay={handleVideoOnPlay}
                style={{ borderRadius: "10px" }}
              />
              <canvas ref={canvasRef} style={{ position: "absolute" }} />
            </div>
          </div>
        ) : (
          <div>loading...</div>
        )
      ) : (
        <></>
      )}
    </>
  );
};

export default Camera;
