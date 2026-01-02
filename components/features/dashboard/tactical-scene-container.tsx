"use client"

import dynamic from "next/dynamic"
import { TacticalFallback } from "./tactical-fallback"

const TacticalShipScene = dynamic(
    () => import("./tactical-ship-scene"),
    {
        ssr: false,
        loading: () => <TacticalFallback />
    }
)

export function TacticalSceneContainer() {
    return <TacticalShipScene />
}
