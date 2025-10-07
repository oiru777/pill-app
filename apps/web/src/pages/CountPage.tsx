import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";

import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { detect } from "../libs/detect";
import { loadMetadata } from "../libs/load_metadata";
import { loadYOLOModel } from "../libs/load_model";
import { getImagePath, getModelPath } from "../libs/model_path";
import { detectView } from "../libs/view/detect";
import { Button } from "@mui/material";

import type { DetectBbox, YOLOMetadata } from "../libs/types";

export const CountPage: FC = () => {
  const [model, setModel] = useState<tf.GraphModel<
    string | tf.io.IOHandler
  > | null>(null);
  const [metadata, setMetadata] = useState<YOLOMetadata | null>(null);
  const [state, setState] = useState<[boolean, string]>([false, ""]);
  const [bboxCount, setBboxCount] = useState<number>(0);
  const [labelCounts, setLabelCounts] = useState<Record<string, number>>({});

  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string>(getImagePath("detect"));
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function predict() {
    setState([true, "推論を実行しています"]);
    if (!imageRef.current || !metadata || !model) {
      return;
    }

    const restoreScale = Math.max(
      imageRef.current.width / metadata.imgsz[0],
      imageRef.current.height / metadata.imgsz[1]
    );

    const bboxes = await detect(model, imageRef.current, metadata.imgsz, 0.4);
    setBboxCount(bboxes.length);

    // ラベルごとのカウント
    const counts: Record<string, number> = {};
    for (const bbox of bboxes) {
      const classIndex = bbox.label;
      const className = metadata.names[classIndex] || `class_${classIndex}`;
      counts[className] = (counts[className] || 0) + 1;
    }
    setLabelCounts(counts);

    detectView(canvasRef.current!, imageRef.current!, restoreScale, bboxes);
    setState([false, "完了"]);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const path = getModelPath("detect");
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setState([true, "メタデータを読み込んでいます"]);
      const metadata = await loadMetadata(path);
      if (metadata === null) {
        setState([false, "メタデータの読み込みに失敗しました"]);
        return;
      }
      setMetadata(metadata);

      setState([true, "モデルを読み込んでいます"]);
      const model = await loadYOLOModel(path, metadata.imgsz);
      if (model === null) {
        setState([false, "モデルの読み込みに失敗しました"]);
        return;
      }
      setModel(model);
      setState([false, "モデルの読み込みが完了しました"]);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center py-12">
      <h3>錠数カウント</h3>

      <label
        htmlFor="input_file"
        className="block mb-2 text-sm font-medium text-center"
      >
        Input file
      </label>
      <input
        id="input_file"
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div>
        <label
          htmlFor="state"
          className="block mb-2 text-sm font-medium text-center"
        >
          State
        </label>
        <p className="text-sm opacity-80">{state[1]}</p>
      </div>

      <button
        onClick={() => predict()}
        disabled={state[0]}
        className={`inline-flex justify-center items-center px-8 py-2 rounded-lg h-12 w-32 text-center text-white text-xl ${
          state[0] ? "bg-cyan-500 opacity-50" : "bg-cyan-500"
        }`}
      >
        {state[0] ? <LoaderCircle className="h-6 w-6 animate-spin" /> : "検出"}
      </button>

      {/* 検出結果の表示 */}
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">検出された物体数: {bboxCount}</p>
        {Object.keys(labelCounts).length > 0 && (
          <div className="mt-2">
            <p className="text-md font-medium underline">ラベルごとの内訳:</p>
            <ul className="mt-1">
              {Object.entries(labelCounts).map(([label, count]) => (
                <li key={label}>
                  {label}: {count} 個
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 入力画像 & 結果描画 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-center">
            Input Image
          </h2>
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Sample for object detection"
            className="w-full max-w-[800px] h-auto rounded-lg shadow-md"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-center">Result</h2>
          <Button variant="outlined">この検出結果で登録</Button>
          <canvas
            ref={canvasRef}
            className="w-full max-w-[800px] h-auto rounded-lg shadow-md"
          ></canvas>
        </div>
      </div>
    </div>
  );
};
