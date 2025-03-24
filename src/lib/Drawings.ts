import { createClient } from "~/utils/supabase/client";

interface LineData {
  id?: string;
  points: number[];
}

export async function fetchLines() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("drawings").select("*");

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching data:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function storeLines(newLine: LineData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drawings")
    .insert([{ points: newLine.points }]);

  if (error) {
    console.error("Error saving line:", error);
    return { success: false, error };
  }

  return { success: true, data };
}
