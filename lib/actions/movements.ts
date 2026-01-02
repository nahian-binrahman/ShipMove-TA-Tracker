"use server"

import { createClient } from "@/lib/supabase/server";
import { generateMovementFingerprint } from "@/lib/fingerprint";
import { Movement, MovementStatus } from "@/types/app";

export interface MovementFilter {
    soldierId?: string;
    status?: MovementStatus;
    type?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Checks if a movement already exists based on tactical fingerprint.
 * Used for pre-submission UX feedback.
 */
export async function checkMovementDuplicate(
    soldierId: string,
    startTime: Date,
    from: string,
    to: string
): Promise<Movement | null> {
    const supabase = await createClient();
    const fingerprint = generateMovementFingerprint(soldierId, startTime, from, to);

    const { data, error } = await supabase
        .from("movements")
        .select("*, soldier:soldiers(full_name, service_number)")
        .eq("movement_fingerprint", fingerprint)
        .single();

    if (error || !data) return null;
    return data as any;
}

/**
 * Validates and inserts a new movement.
 * Built-in race condition handling via DB constraint.
 */
export async function createMovementAction(
    values: any,
    fingerprint: string
): Promise<{ success: boolean; data?: Movement; error?: string; existingId?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("movements")
        .insert([{
            ...values,
            movement_fingerprint: fingerprint,
        }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            // Re-fetch existing to return ID
            const { data: existing } = await supabase
                .from("movements")
                .select("id")
                .eq("movement_fingerprint", fingerprint)
                .single();

            return {
                success: false,
                error: "Duplicate movement detected.",
                existingId: existing?.id
            };
        }
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function fetchMovements(filters: MovementFilter = {}) {
    const supabase = await createClient();

    let query = supabase
        .from("movements")
        .select("*, soldier:soldiers(full_name, service_number, rank)")
        .order("created_at", { ascending: false });

    if (filters.soldierId) {
        query = query.eq("soldier_id", filters.soldierId);
    }
    if (filters.status) {
        query = query.eq("status", filters.status);
    }
    if (filters.type) {
        query = query.eq("movement_type", filters.type);
    }
    if (filters.startDate) {
        query = query.gte("start_time", filters.startDate);
    }
    if (filters.endDate) {
        query = query.lte("start_time", filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching movements:", error);
        return [];
    }

    return data || [];
}

export async function fetchMovementAudit(movement_id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("movement_audit")
        .select("*, profile:profiles(full_name), metadata")
        .eq("movement_id", movement_id)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching movement audit:", error);
        return [];
    }

    return data || [];
}

export async function updateMovementStatus(
    movementId: string,
    status: MovementStatus,
    notes?: string
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("movements")
        .update({ status, notes: notes || null })
        .eq("id", movementId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function fetchDashboardStats() {
    const supabase = await createClient();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: movements, error } = await supabase
        .from("movements")
        .select("status, ta_amount, start_time");

    if (error) {
        // Log as warning to avoid crashing Next.js dev overlay while user is still running migrations
        console.warn("Operational stats temporarily unavailable (Check if migrations are fully applied):", error.message);
        return {
            activeCount: 0,
            pendingCount: 0,
            totalSpend: 0,
            todayCount: 0,
            monthSpend: 0,
            locationCount: 0 // Indicates system is in setup mode
        };
    }

    const stats = {
        activeCount: movements.filter(m => m.status === 'approved').length,
        pendingCount: movements.filter(m => m.status === 'pending').length,
        totalSpend: movements.reduce((acc, m) => acc + (m.ta_amount || 0), 0),
        todayCount: movements.filter(m => new Date(m.start_time) >= new Date(startOfToday)).length,
        monthSpend: movements
            .filter(m => new Date(m.start_time) >= new Date(startOfMonth))
            .reduce((acc, m) => acc + (m.ta_amount || 0), 0),
        locationCount: 12
    };

    return stats;
}
