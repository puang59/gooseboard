/* eslint-disable */
import { useEffect, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { fetchLines, storeLines } from "~/lib/Drawings";

interface LineData {
  id?: string;
  points: number[];
}

export default function CanvasComponent() {
  const [lines, setLines] = useState<LineData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const loadLines = async () => {
      const { success, data, error } = await fetchLines();
      if (!success) {
        console.error("Error fetching lines:", error);
      } else {
        setLines(
          data?.map((line: LineData) => ({
            id: line.id,
            points: line.points,
          })) ?? [],
        );
      }
    };
    loadLines();
  }, []);

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines((prevLines) => [...prevLines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines((prevLines) => {
      const newLines = [...prevLines];
      const lastLine = newLines[newLines.length - 1];
      if (lastLine) {
        lastLine.points = [...lastLine.points, point.x, point.y];
      }
      return newLines;
    });
  };

  const handleMouseUp = async () => {
    setIsDrawing(false);
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      const { success, error } = await storeLines(lastLine);
      if (!success) {
        console.error("Error saving line:", error);
      }
    }
  };

  useEffect(() => {
    console.log("Line cords: ", lines);
  }, [lines]);

  return (
    <Stage
      width={typeof window !== "undefined" ? window.innerWidth : 800}
      height={typeof window !== "undefined" ? window.innerHeight : 600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="bg-white"
    >
      <Layer>
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke="black"
            strokeWidth={3}
            tension={0.5}
            lineCap="round"
          />
        ))}
      </Layer>
    </Stage>
  );
}
