import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

export function Count() {
  const [imageSrc, setImageSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [boxes, setBoxes] = useState([]);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageSrc || boxes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    if (!img.complete) return;

    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    console.log("img:", img.clientWidth, img.clientHeight);
    console.log("canvas:", canvas.width, canvas.height);

    const scaleX = img.width / 640;
    const scaleY = img.height / 640;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.fillStyle = "red";

    boxes.forEach((box) => {
      const [xmin, ymin, xmax, ymax, label] = box;

      const x = xmin * scaleX;
      const y = ymin * scaleY;
      const width = (xmax - xmin) * scaleX;
      const height = (ymax - ymin) * scaleY;

      ctx.strokeRect(x, y, width, height);
      ctx.fillText(label, x + 4, y + 16);
    });
  }, [boxes, imageSrc]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgURL = URL.createObjectURL(file);
    setImageSrc(imgURL);
    setBoxes([]);
    setResult(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgURL;

    img.onload = async () => {
      try {
        const counts = {};
        const finalBoxes = [];

        const model = await tf.loadGraphModel("/model/model.json");

        const tensor = tf.browser
          .fromPixels(img)
          .resizeBilinear([640, 640])
          .toFloat()
          .div(tf.scalar(255.0))
          .expandDims();

        const output = await model.executeAsync(tensor);
        const outputTensor = Array.isArray(output) ? output[0] : output;

        const results = await parseYOLOOutput(outputTensor);

        const labelMap = {
          0: "bron",
          1: "restamin",
          2: "medicon",
          3: "pabrongold",
        };

        for (const det of results) {
          const label = labelMap[det.classId] || `class_${det.classId}`;
          counts[label] = (counts[label] || 0) + 1;
          finalBoxes.push([...det.bbox, label]);
        }

        setBoxes(finalBoxes);

        const resultText =
          Object.entries(counts)
            .map(([label, count]) => `・${label}: ${count}錠`)
            .join("\n") || "認識できませんでした";

        setResult(`錠数カウント結果:\n${resultText}`);

        tf.dispose(outputTensor);
      } catch (error) {
        console.error("推論エラー:", error);
        setResult("エラーが発生しました");
      }
    };
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>錠剤カウンター</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <div style={{ position: "relative", display: "inline-block" }}>
        {imageSrc && (
          <>
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Uploaded"
              style={{ width: "640px", height: "auto" }} // 強制640表示
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </div>
      {result && (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "1.1rem" }}>
          {result}
        </pre>
      )}
    </div>
  );
}

// YOLOv8形式の出力 [1, 300, 6] → 検出結果に変換（640スケール固定）
async function parseYOLOOutput(outputTensor) {
  console.log("outputTensor.shape:", outputTensor.shape);

  const data = await outputTensor.squeeze().array(); // shape: [300, 6]
  console.log("outputTensor.shape:", outputTensor.shape);

  const boxes = [];
  const scores = [];
  const classIds = [];

  for (let i = 0; i < data.length; i++) {
    const [x, y, w, h, conf, classId] = data[i];

    if (conf > 0.5) {
      const xmin = x - h / 2;
      const ymin = y - w / 2;
      const xmax = x + h / 2;
      const ymax = y + w / 2;

      boxes.push([xmin, ymin, xmax, ymax]);
      console.log([xmin, ymin, xmax, ymax]);
      scores.push(conf);
      classIds.push(Math.round(classId));
    }
  }

  const boxesTensor = tf.tensor2d(boxes);
  const scoresTensor = tf.tensor1d(scores);
  const selectedIndices = await tf.image.nonMaxSuppressionAsync(
    boxesTensor,
    scoresTensor,
    100,
    0.5,
    0.5
  );

  const selected = await selectedIndices.array();

  boxesTensor.dispose();
  scoresTensor.dispose();
  selectedIndices.dispose();

  const results = [];

  for (const i of selected) {
    results.push({
      bbox: boxes[i],
      score: scores[i],
      classId: classIds[i],
    });
  }

  return results;
}
