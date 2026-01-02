import * as z from "zod"

export const movementSchema = z.object({
    soldier_id: z.string().uuid("Please select a valid personnel"),
    start_time: z.date({
        message: "Start time is required",
    }),
    end_time: z.date({
        message: "End time is required",
    }),
    from_location: z.string().min(2, "From location is required"),
    to_location: z.string().min(2, "To location is required"),
    movement_type: z.string().min(1, "Type is required"),
    transport_mode: z.string().min(1, "Mode is required"),
    ta_amount: z.coerce.number().min(0, "TA Amount must be positive"),
    notes: z.string().optional(),
}).refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
})

export type MovementFormValues = z.infer<typeof movementSchema>
