import { useEffect, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { fetchLines, storeLines, clearLines } from "~/lib/Drawings";
import type { KonvaEventObject } from "konva/lib/Node";

interface LineData {
  id?: string;
  points: number[];
  color: string;
  brushSize: number;
}

export default function CanvasComponent() {
  const [lines, setLines] = useState<LineData[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#FF7B76"); // Default to coral color
  const [brushSize, setBrushSize] = useState<number>(3);

  // Define color palette
  const colorPalette: string[] = [
    "#FF7B76", // coral
    "#4A9F5A", // green
    "#CB7BFF", // purple
    "#5794D7", // blue
  ];

  useEffect(() => {
    const loadLines = async () => {
      try {
        const { success, data, error } = await fetchLines();
        if (!success) {
          console.error("Error fetching lines:", error);
        } else {
          setLines(
            data?.map((line: LineData) => ({
              id: line.id,
              points: line.points || [],
              color: line.color || "#FF7B76", // Default if missing
              brushSize: line.brushSize || 3, // Default if missing
            })) ?? [],
          );
        }
      } catch (err) {
        console.error("Exception in loadLines:", err);
      }
    };

    // Await the loadLines function
    void loadLines(); // Use void to explicitly ignore the promise
  }, []);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true);
    const stage = e.target.getStage();
    if (stage) {
      const pos = stage.getPointerPosition();
      if (pos) {
        setLines((prevLines) => [
          ...prevLines,
          { points: [pos.x, pos.y], color, brushSize },
        ]);
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    if (stage) {
      const point = stage.getPointerPosition();
      if (point) {
        setLines((prevLines) => {
          const newLines = [...prevLines];
          const lastLine = newLines[newLines.length - 1];
          if (lastLine) {
            lastLine.points = [...lastLine.points, point.x, point.y];
          }
          return newLines;
        });
      }
    }
  };

  const handleMouseUp = async () => {
    setIsDrawing(false);
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      try {
        const { success, error } = await storeLines(lastLine);
        if (!success) {
          console.error("Error saving line:", error);
        }
      } catch (err) {
        console.error("Exception while saving line:", err);
      }
    }
  };

  const handleClearCanvas = async () => {
    try {
      const { success, error } = await clearLines();
      if (!success) {
        console.error("Error clearing lines:", error);
      } else {
        setLines([]);
      }
    } catch (err) {
      console.error("Exception while clearing canvas:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-200 p-4">
      {/* Color Palette */}
      <div className="mb-6 flex w-full justify-center gap-6">
        {colorPalette.map((paletteColor, index) => (
          <button
            key={index}
            className="h-12 w-12 rounded-lg shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: paletteColor,
              borderWidth: color === paletteColor ? "3px" : "0px",
              borderColor: "white",
              borderStyle: "solid",
            }}
            onClick={() => setColor(paletteColor)}
          />
        ))}
      </div>

      {/* Drawing Canvas */}
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        <Stage
          width={800}
          height={500}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchstart={handleMouseDown}
          onTouchmove={handleMouseMove}
          onTouchend={handleMouseUp}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.brushSize}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Controls at the bottom */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <button
          onClick={handleClearCanvas}
          className="rounded-lg bg-red-400 px-6 py-2 text-white transition-colors hover:bg-red-500"
        >
          clear
        </button>

        <div className="w-48">
          <input
            type="range"
            min="1"
            max="12"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full accent-gray-600"
          />
        </div>
      </div>
    </div>
  );
}
