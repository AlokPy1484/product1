"use client"
import Image from "next/image";
import { useGridConfig } from "./context/GridConfigContext";
import { hex } from "motion";
import { cn } from "@/lib/utils";
import { useSelector } from "./context/ViewSelectorContext";
import HeroDemo from "@/components/Demo/HeroDemo";
import CardDemo from "@/components/Demo/CardDemo";

export default function Home() {



  const { config } = useGridConfig()





  const hexToRgb = (hex) => {
    // Remove the #
    hex = hex.replace("#", "");

    // Handle shorthand hex (#fff)
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const bigint = parseInt(hex, 16);

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };


  const dotColour = config.primaryColour
  const { r, g, b } = hexToRgb(dotColour)

  const bgColour = config.backgroundColour


  const { selected } = useSelector()


  if (selected === "Blank") {



    return (

      <div className={cn("w-screen h-screen ")}
        style={{
          backgroundImage: `radial-gradient(circle at 0.5px  0.5px, rgba(${r},${g},${b}, ${config.opacity}) ${config.scale}px, transparent 0)`,
          backgroundSize: `${config.spacing}px ${config.spacing}px`,
          backgroundRepeat: "repeat",
          opacity: `1`,
          backgroundColor: config.backgroundColour
        }}>
        <div className="w-screen h-screen bg-re0">

        </div>
      </div>

    )
  }


  if (selected === "Hero") {
    return (
      <div className="w-screen h-screen overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 0.5px  0.5px, rgba(${r},${g},${b}, ${config.opacity}) ${config.scale}px, transparent 0)`,
          backgroundSize: `${config.spacing}px ${config.spacing}px`,
          backgroundRepeat: "repeat",
          opacity: `1`,
          backgroundColor: config.backgroundColour
        }}>
        <HeroDemo />
      </div>
    )
  }

  if (selected === "Card") {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-neutral-900">
        <div className="flex justify-center items-center p-2 rounded-2xl  bg-none "
          style={{
            backgroundImage: `radial-gradient(circle at 0.5px  0.5px, rgba(${r},${g},${b}, ${config.opacity}) ${config.scale}px, transparent 0)`,
            backgroundSize: `${config.spacing}px ${config.spacing}px`,
            backgroundRepeat: "repeat",
            opacity: `1`,
            backgroundColor: config.backgroundColour
          }}
        >
          <CardDemo />
        </div>
      </div>
    )
  }
}
