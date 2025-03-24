/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import {
  fetchLines,
  storeLines,
  clearLines,
  subscribeToDrawings,
  subscribeToDrawingDeletions,
} from "~/lib/Drawings";
import type { KonvaEventObject } from "konva/lib/Node";
import { useSession } from "next-auth/react";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface LineData {
  id?: string;
  points: number[];
  color: string;
  brushSize: number;
  userId?: string;
}

export default function CanvasComponent() {
  const [lines, setLines] = useState<LineData[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#FF7B76");
  const [brushSize, setBrushSize] = useState<number>(3);
  const [userLines, setUserLines] = useState<string[]>([]);
  const { data: session } = useSession();

  const colorPalette: string[] = ["#FF7B76", "#4A9F5A", "#CB7BFF", "#5794D7"];
  console.log(userLines);

  useEffect(() => {
    const loadLines = async () => {
      try {
        const { success, data, error } = await fetchLines();
        if (!success) {
          console.error("Error fetching lines:", error);
        } else {
          const fetchedLines =
            data?.map((line: LineData) => ({
              id: line.id,
              points: line.points || [],
              color: line.color || "#FF7B76",
              brushSize: line.brushSize || 3,
              userId: line.userId,
            })) ?? [];

          setLines(fetchedLines);

          if (session?.user?.id) {
            const currentUserLineIds = fetchedLines
              .filter((line) => line.userId === session.user.id && line.id)
              .map((line) => line.id!);

            setUserLines(currentUserLineIds);
          }
        }
      } catch (err) {
        console.error("Exception in loadLines:", err);
      }
    };

    void loadLines();

    let lineSubscription: RealtimeChannel | null = null;
    let deletionSubscription: RealtimeChannel | null = null;

    // lineSubscription = subscribeToDrawings((newLine) => {
    //   if (!lines.some((line) => line.id === newLine.id)) {
    //     setLines((prevLines) => [...prevLines, newLine]);
    //   }
    // });

    lineSubscription = subscribeToDrawings((newLine) => {
      setLines((prevLines) => {
        if (!prevLines.some((line) => line.id === newLine.id)) {
          return [...prevLines, newLine];
        }
        return prevLines;
      });
    });

    deletionSubscription = subscribeToDrawingDeletions((deletedLineIds) => {
      setLines((prevLines) =>
        prevLines.filter((line) => !deletedLineIds.includes(line.id ?? "")),
      );
    });

    return () => {
      if (lineSubscription) {
        void lineSubscription.unsubscribe();
      }
      if (deletionSubscription) {
        void deletionSubscription.unsubscribe();
      }
    };
  }, [session]);

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
        const { success, data, error } = await storeLines(lastLine);
        if (!success) {
          console.error("Error saving line:", error);
        } else if (data && data.length > 0 && data[0]?.id) {
          setUserLines((prev) => [...prev, data[0]?.id ?? ""]);

          setLines((prevLines) => {
            const newLines = [...prevLines];
            newLines[newLines.length - 1] = data[0] ?? {
              id: "",
              points: [],
              color: "",
              brushSize: 0,
              userId: "",
            };
            return newLines;
          });
        }
      } catch (err) {
        console.error("Exception while saving line:", err);
      }
    }
  };

  const handleClearCanvas = async () => {
    try {
      if (!session?.user?.id) {
        console.error("User not authenticated");
        return;
      }

      const { success, error } = await clearLines();
      if (!success) {
        console.error("Error clearing lines:", error);
      } else {
        setLines((prevLines) =>
          prevLines.filter((line) => line.userId !== session.user.id),
        );
        setUserLines([]);
      }
    } catch (err) {
      console.error("Exception while clearing canvas:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-200 p-4">
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

      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        <Stage
          width={900}
          height={600}
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

      <div className="mt-6 flex flex-col items-center gap-4">
        <button
          onClick={handleClearCanvas}
          className="rounded-lg bg-red-400 px-6 py-2 text-white transition-colors hover:bg-red-500"
          disabled={!session}
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

      {!session && (
        <div className="mt-4 text-red-500">
          You need to be logged in to save or clear drawings
        </div>
      )}
    </div>
  );
}
