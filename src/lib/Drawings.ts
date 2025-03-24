// lib/Drawings.ts
import { createClient } from "~/utils/supabase/client";

interface LineData {
  id?: string;
  points: number[];
  color: string;
  brushSize: number;
}

export async function fetchLines() {
  try {
    const supabase = createClient();

    // Check if we have a valid client
    if (!supabase) {
      console.error("Could not create Supabase client");
      return { success: false, error: "No Supabase client" };
    }

    const { data, error } = await supabase
      .from("drawings")
      .select("id, points, color, brushSize");

    // Log the response for debugging
    console.log("Supabase fetch response:", { data, error });

    if (error) {
      console.error("Supabase error fetching data:", error.message || error);
      return { success: false, error: error.message || "Unknown error" };
    }

    // Check if data exists and has the expected format
    if (!data) {
      console.warn("No data returned from Supabase");
      return { success: true, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Exception in fetchLines:", error);
    return { success: false, error: "Internal error in fetchLines" };
  }
}

export async function storeLines(newLine: LineData) {
  try {
    const supabase = createClient();

    // Check if we have a valid client
    if (!supabase) {
      console.error("Could not create Supabase client");
      return { success: false, error: "No Supabase client" };
    }

    // Validate the data before inserting
    if (!newLine.points || !Array.isArray(newLine.points)) {
      console.error("Invalid line data:", newLine);
      return { success: false, error: "Invalid line data" };
    }

    const { data, error } = await supabase.from("drawings").insert([
      {
        points: newLine.points,
        color: newLine.color || "black",
        brushSize: newLine.brushSize || 3,
      },
    ]);

    // Log the response for debugging
    console.log("Supabase insert response:", { data, error });

    if (error) {
      console.error("Supabase error saving line:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Exception in storeLines:", error);
    return { success: false, error: "Internal error in storeLines" };
  }
}

export async function clearLines() {
  try {
    const supabase = createClient();

    // Check if we have a valid client
    if (!supabase) {
      console.error("Could not create Supabase client");
      return { success: false, error: "No Supabase client" };
    }

    const { error } = await supabase.from("drawings").delete().neq("id", 0);

    // Log the response for debugging
    console.log("Supabase delete response:", { error });

    if (error) {
      console.error("Supabase error clearing lines:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception in clearLines:", error);
    return { success: false, error: "Internal error in clearLines" };
  }
}
