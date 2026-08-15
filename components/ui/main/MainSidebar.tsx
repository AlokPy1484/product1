"use client"

import { CircleQuestionMark, CodeXml, DraftingCompass, MessageSquareText, Palette, Scale, SidebarClose } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, useSidebar } from "../sidebar";
import { Slider } from "../slider";
import { useState } from "react";
import { motion } from "motion/react"
import { useGridConfig } from "@/app/context/GridConfigContext";
import { cn } from "@/lib/utils";
import { toast } from "../toast";




export default function MainSidebar() {


    const [scale, setScale] = useState<number>(0);

    const { open, setOpen } = useSidebar()

    const { config, updateConfig } = useGridConfig()

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





    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(style, null, 2))
        }
        catch (err) {
            console.log(err)
        }
    }


    const style = {
        backgroundImage: `radial-gradient(circle at 0.5px  0.5px, rgba(${r}, ${g}, ${b}, ${config.opacity}) ${config.scale}px, transparent 0)`,
        backgroundSize: `${config.spacing}px ${config.spacing}px`,
        backgroundRepeat: "repeat",
        opacity: `1`,
        backgroundColor: config.backgroundColour
    }


    function showToast() {
        const id = toast.add({
            title: "Style copied",
            description: "Your css pattern has been copied"
        })
    }



    return (
        <Sidebar className=" border-black text-neutral-100 w-auto top-[50px] h-[calc(100svh-var(--navbar-height))]" collapsible="icon">
            <SidebarHeader className="flex flex-col justify-center items-start bg-neutral-900/99 p-4">
                <a className="flex justify-center items-center gap-2 text-3xl font-thin" onClick={() => { setOpen(prev => !prev) }} ><SidebarClose strokeWidth={1} size={28} />{open && <p> Control Pannel</p>}</a>
                {/* {open && <a className="text-sm font-light uppercase text-neutral-500">Edit Pattern Parameters</a>} */}


            </SidebarHeader>
            <SidebarContent className="flex flex-col justify-center items-center gap-4 bg-neutral-900/99 border-r-black  w-full overflow-scroll px-2">
                <SidebarGroup className={cn(open ? "items-start" : "items-center", "flex flex-col justify-start gap-4")}>


                    <div className="flex justify-start items-center text-xs gap-2 uppercase">
                        <DraftingCompass strokeWidth={1} />
                        {open && (<a>Geometry</a>)}
                    </div>
                    {geometryControls.map((item, idx) => (


                        <div key={idx} className="flex flex-col w-full py-2">
                            {open ? (
                                <motion.div

                                    className="flex flex-col justify-center items-start w-full gap-4">
                                    <div className="flex justify-between items-center w-full text-sm text-white">
                                        <a>{item.label}</a>
                                        <motion.a
                                            className="flex justify-center text-xs  bg-neutral-900 border border-neutral-800 p-1">{config[item.key]}{item.unit}</motion.a>
                                    </div>



                                    <Slider
                                        defaultValue={config[item.key]}
                                        min={item.min}
                                        max={item.max}
                                        step={item.step}
                                        onValueChange={(val) => updateConfig({ [item.key]: val })}
                                        className="mx-auto w-full max-w-xs"
                                    />

                                </motion.div>) : (
                                <motion.div
                                    className="flex justify-center text-[8px]  bg-neutral-900 border border-neutral-800 p-1">{config[item.key]}</motion.div>
                            )}
                        </div>



                    ))}



                </SidebarGroup>
                <SidebarGroup className={cn(open ? "items-start" : "items-center", "flex flex-col justify-start gap-4")}>

                    <div className="flex justify-start items-center text-xs gap-2 uppercase">
                        <Palette strokeWidth={1} />
                        {open && <a>Colors</a>}
                    </div>
                    <div className="flex flex-col justify-start items-center gap-4 w-full text-sm font-light">

                        {open ?

                            <div className="flex justify-between items-center p-2 border border-neutral-800 w-full">
                                <a className="upeercase">Primary</a>
                                <div className="flex justify-center items-center gap-2">
                                    {config.primaryColour}
                                    <input
                                        type="color"
                                        value={config.primaryColour}
                                        onChange={(e) => updateConfig({ primaryColour: e.target.value })}
                                    />
                                </div>
                            </div>
                            :
                            <input
                                type="color"
                                value={config.primaryColour}
                                onChange={(e) => updateConfig({ primaryColour: e.target.value })}
                                className="w-5 h-5 "
                            />
                        }
                        {open ?
                            <div className="flex justify-between items-center p-2 border border-neutral-800 w-full">
                                <a className="upeercase">Background</a>
                                <div className="flex justify-center items-center gap-2">
                                    {config.backgroundColour}
                                    <input
                                        type="color"
                                        value={config.backgroundColour}
                                        onChange={(e) => updateConfig({ backgroundColour: e.target.value })}
                                    />
                                </div>
                            </div> :
                            <input
                                type="color"
                                value={config.backgroundColour}
                                onChange={(e) => updateConfig({ backgroundColour: e.target.value })}
                                className="w-5 h-5"
                            />
                        }
                        {/* <div className="flex flex-col justify-center items-start w-full gap-4">
                            <div className="flex justify-between items-center w-full text-sm">
                                <a>Opacity</a>
                                <a>40px</a>
                            </div>
                            { }
                            <Slider
                                defaultValue={config.opacity}
                                min={geometryControls[0].min}
                                max={geometryControls[0].max}
                                step={geometryControls[0].step}
                                onValueChange={(val) => updateConfig({ [geometryControls[0].key]: val })}
                                className="mx-auto w-full max-w-xs"
                            />

                        </div> */}

                    </div>

                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter className="flex flex-col justify-center items-start bg-neutral-900/99 border-t-black">
                <div onClick={handleCopy} className={cn(open ? "p-4" : "p-0", "w-full border border-neutral-800 flex justify-center gap-4 items-center cursor-pointer")}>
                    <CodeXml strokeWidth={1} />
                    {open && <a onClick={showToast}> Get Code</a>}
                </div>


                <div className={cn(open ? "flex-row" : "flex-col", "flex justify-between items-center w-full text-xs font-thin text-neutral-400 p-2 gap-4")}>
                    <div className="flex justify-start items-center gap-2">
                        <CircleQuestionMark size={18} strokeWidth={1} />
                        {open && <a> Help</a>}
                    </div>
                    <div className="flex justify-start items-center gap-2">
                        <MessageSquareText size={18} strokeWidth={1} />
                        {open && <a> Feedback</a>}
                    </div>

                </div>


            </SidebarFooter>

        </Sidebar>
    )
}



// type GeometryItemsType = {
//     title: string,
//     min: number,
//     max: number,

//     function: (value: string) => void
// }

// const GeometryItems: GeometryItemsType[] = [
//     {
//         title: "Scale",
//         min: 0,
//         max: 0,
//         function: () => { }
//     },
//     {
//         title: "Rotation",
//         min: 0,
//         max: 0,
//         function: () => {
//         }
//     },
//     {
//         title: "Spacing",
//         min: 0,
//         max: 0,
//         function: () => { }
//     }
// ]



const geometryControls = [
    {
        key: "opacity" as const,
        label: "Opacity",
        min: 0.1,
        max: 1,
        step: 0.1,
        unit: "px"
    },
    {
        key: "scale" as const,
        label: "Scale",
        min: 0.1,
        max: 3,
        step: 0.1,
        unit: "x"
    },
    {
        key: "spacing" as const,
        label: "Spacing",
        min: 10,
        max: 100,
        step: 1,
        unit: "px"
    },

]



