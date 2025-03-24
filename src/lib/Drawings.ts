import { createClient } from "~/utils/supabase/client";
import { getSession } from "next-auth/react";

interface LineData {
  id?: string;
  points: number[];
  color: string;
  brushSize: number;
  userId?: string;
}

interface StoreLineResponse {
  id: string;
  points: number[];
  color: string;
  brushSize: number;
  userId: string;
}

export async function fetchLines() {
  try {
    const supabase = createClient();

    if (!supabase) {
      console.error("Could not create Supabase client");
      return { success: false, error: "No Supabase client" };
    }

    const { data, error } = await supabase
      .from("drawings")
      .select("id, points, color, brushSize, userId");

    console.log("Supabase fetch response:", { data, error });

    if (error) {
      console.error("Supabase error fetching data:", error.message || error);
      return { success: false, error: error.message || "Unknown error" };
    }

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

    const session = await getSession();
    const userId = session?.user?.id ?? null;

    if (!supabase) {
      console.error("Could not create Supabase client");
      return { success: false, error: "No Supabase client" };
    }

    if (!newLine.points || !Array.isArray(newLine.points)) {
      console.error("Invalid line data:", newLine);
      return { success: false, error: "Invalid line data" };
    }

    const { data, error } = await supabase
      .from("drawings")
      .insert([
        {
          points: newLine.points,
          color: newLine.color || "black",
          brushSize: newLine.brushSize || 3,
          userId: userId,
        },
      ])
      .select();

    console.log("Supabase insert response:", { data, error });

    if (error) {
      console.error("Supabase error saving line:", error);
      return { success: false, error };
    }

    const typedData = data as StoreLineResponse[];

    return { success: true, data: typedData };
  } catch (error) {
    console.error("Exception in storeLines:", error);
    return { success: false, error: "Internal error in storeLines" };
  }
}

export async function clearLines() {
  try {
    const supabase = createClient();

    const session = await getSession();
    const userId = session?.user?.id;

    if (!supabase) {
      console.error("Could not create Supabase client");
      return { success: false, error: "No Supabase client" };
    }

    if (!userId) {
      console.warn("No user ID found, cannot clear lines");
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("drawings")
      .delete()
      .eq("userId", userId);

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

export function subscribeToDrawings(callback: (line: LineData) => void) {
  const supabase = createClient();

  if (!supabase) {
    console.error("Could not create Supabase client for subscription");
    return null;
  }

  const subscription = supabase
    .channel("drawings-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "drawings",
      },
      (payload) => {
        console.log("New line received:", payload);
        if (payload.new) {
          callback(payload.new as LineData);
        }
      },
    )
    .subscribe();

  return subscription;
}

export function subscribeToDrawingDeletions(
  callback: (deletedLineIds: string[]) => void,
) {
  const supabase = createClient();

  if (!supabase) {
    console.error("Could not create Supabase client for deletion subscription");
    return null;
  }

  const subscription = supabase
    .channel("drawings-deletions")
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "drawings",
      },
      (payload) => {
        console.log("Deletion detected:", payload);
        if (payload.old?.id) {
          callback([payload.old.id as string]);
        }
      },
    )
    .subscribe();

  return subscription;
}
