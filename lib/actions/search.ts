"use server"

import { createClient } from "@/lib/supabase/server";

export async function globalSearch(query: string) {
    const supabase = await createClient();

    if (!query || query.length < 2) return { soldiers: [], movements: [] };

    const [soldiersResult, movementsResult] = await Promise.all([
        supabase
            .from("soldiers")
            .select("id, full_name, service_number, rank")
            .or(`full_name.ilike.%${query}%,service_number.ilike.%${query}%`)
            .limit(5),
        supabase
            .from("movements")
            .select("id, from_location, to_location, soldier:soldiers(full_name)")
            .or(`from_location.ilike.%${query}%,to_location.ilike.%${query}%`)
            .limit(5)
    ]);

    return {
        soldiers: soldiersResult.data || [],
        movements: movementsResult.data || []
    };
}
