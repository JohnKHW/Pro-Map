/* eslint-disable no-loop-func */
import React, { useEffect, useRef, useState } from "react";
import ExcelJs from "exceljs";
import * as faceapi from "face-api.js";

import { DateTime } from "luxon";
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

  const worksheet = (workbook, data, name) => {
    const sheet = workbook.addWorksheet(name);
    const headers = [];
    const rows = [];
    const startTime = data[0].timestamp;
    data?.forEach((_d, i) => {
      const row = [];
      Object.keys(_d).forEach((key) => {
        if (!headers.includes(key) && i === 0) {
          headers.push({ name: key });
        }
        if (key === "timestamp") {
          // minus startTime to seconds
          row.push((_d[key] - startTime) / 1000);
        } else {
          row.push(_d[key]);
        }
      });
      rows.push(row);
    });
    sheet.addTable({
      name: name, // 表格內看不到的，算是key值，讓你之後想要針對這個table去做額外設定的時候，可以指定到這個table
      ref: "A1", // 從A1開始
      columns: headers,
      rows,
    });
  };

  const downloadExcel = (expressions = []) => {
    console.log("expression", expression);
    const workbook = new ExcelJs.Workbook();

    const timestampSheet = worksheet(workbook, expression, "By Timestamp");
    console.log("timestampSheet", groupingDataBySecond(expression));
    const secondSheet = worksheet(
      workbook,
      groupingDataBySecond(expression),
      "By Second"
    );
    workbook.xlsx.writeBuffer().then((content) => {
      const link = document.createElement("a");
      const blobData = new Blob([content], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      link.download = "Expression Result.xlsx";
      link.href = URL.createObjectURL(blobData);
      link.click();
    });
  };

  const groupingDataBySecond = (_data) => {
    const result = [];
    let startIdx = 0;
    let currSec = 0;
    // average data by second
    for (let i = 0; i < _data.length; i++) {
      const deltaTime = (_data[i].timestamp - _data[startIdx].timestamp) / 1000;
      if (deltaTime >= 1) {
        const groupData = _data.slice(startIdx, i);
        const data = groupData.reduce((acc, cur) => {
          const reuslt = {};
          Object.keys(acc).forEach((key) => {
            if (!reuslt[key]) {
              reuslt[key] = acc[key] + cur[key];
            }
          });
          return reuslt;
        });
        // get average
        Object.keys(data).forEach((key) => {
          if (key !== "timestamp") {
            data[key] = data[key] / groupData.length;
          } else {
            data[key] = currSec * 1000;
          }
        });
        // get average
        // Object.keys(data).forEach((key) => {
        //   if (key !== "timestamp") {
        //     data[key] = data[key] / data.length;
        //   } else {
        //     data[key] = Math.floor(data[key] - _data[0].timestamp);
        //   }
        // });
        result.push({ ...data });
        startIdx = i;
        currSec++;
      }
    }
    return result;
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
            <Button
              onClick={() => {
                downloadExcel(expression);
              }}
              variant="outline-primary"
            >
              Download
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
