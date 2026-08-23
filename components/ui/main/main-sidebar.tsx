"use client"

import { RangeSlider } from "../range-slider"
import { Button } from "../button"
import { ButtonGroup } from "../button-group"
import { Bookmark, ChevronDown, Copy, Diamond, Dice1, DicesIcon, Donut, LineChart, RotateCw, Undo } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarTrigger,
} from "../sidebar"
import { useState } from "react"
import { useGridConfig } from "@/app/context/GridConfigContext"
import { toast } from "../toast";
import { getPatternCSS } from "@/app/utils.ts/pattern-utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"


export function MainSidebar() {

    const [value, setValue] = useState(100)

    const [patternIndex, setPatternIndex] = useState(0)


    const patternType = [
        {
            id: 0,
            lable: "Dots",
            icon: <Donut />,
            function: () => updateConfig({ pattern: "dots" })
        },
        {
            id: 1,
            lable: "Striped",
            icon: <LineChart />,
            function: () => updateConfig({ pattern: "striped" })
        },
        {
            id: 2,
            lable: "Grid",
            icon: <Diamond />,
            function: () => updateConfig({ pattern: "grid" })
        }
    ]


    const patternParameters = [
        {
            key: "scale",
            lable: "Scale",
            types: ["dots", "striped", "grid"],
            component: "slider",
            min: 0.1,
            max: 3,
            step: 0.1,
            unit: "x"
        },
        {
            key: "spacing",
            lable: "Spacing",
            types: ["dots", "striped", "grid"],
            component: "slider",
            min: 10,
            max: 100,
            step: 1,
            unit: "px"
        },
        {
            key: "opacity",
            lable: "Opacity",
            types: ["dots", "striped", "grid"],
            component: "slider",
            min: 0.1,
            max: 1,
            step: 0.1,
            unit: "%"
        },
        {
            key: "primaryRotation",
            lable: "Rotation A",
            types: ["striped", "grid"],
            component: "slider",
            min: 0,
            max: 180,
            step: 1,
            unit: "deg"
        },
        {
            key: "secondaryRotation",
            lable: "Rotation B",
            types: ["grid"],
            component: "slider",
            min: 0,
            max: 180,
            step: 1,
            unit: "deg"
        },
        {
            key: "primaryColour",
            lable: "Primary Colour",
            types: ["dot", "striped", "grid"],
            component: "color"
        },
        {
            key: "backgroundColour",
            lable: "Background Colour",
            types: ["dot", "striped", "grid"],
            component: "color"
        }
    ]


    const { config, updateConfig, resetConfig } = useGridConfig()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(getPatternCSS(config), null, 2))

            const id = toast.add({
                title: "Style Copied",
                description: "Your css pattern has been copied"
            })
        }
        catch (err) {
            console.log(err)
        }
    }


    // function showToast() {
    //     const id = toast.add({
    //         title: "Style copied",
    //         description: "Your css pattern has been copied"
    //     })
    // }


    function generateRandom() {

        const patternType = ["dot", "striped", "grid"]

        updateConfig({ 'primaryColour': `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}` },)
        updateConfig({ 'backgroundColour': `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}` },)
        updateConfig({ 'pattern': patternType[Math.floor(Math.random() * (2 - 0 + 1)) + 0] })
        updateConfig({ 'scale': Math.floor(Math.random() * (3 - 0.1 + 1)) + 0.1 })
        updateConfig({ 'spacing': Math.floor(Math.random() * (100 - 10 + 1)) + 10 })
        updateConfig({ 'opacity': Math.floor(Math.random() * (1 - 0.1 + 1)) + 0.1 })
        updateConfig({ 'primaryRotation': Math.floor(Math.random() * (180 + 1)) })
        updateConfig({ 'secondaryRotation': Math.floor(Math.random() * (180 + 1)) })
    }







    return (
        <Sidebar className="flex flex-col  justify-between rounded  rounded-4xl " variant="floating" collapsible="icon">
            <SidebarHeader className="flex flex-row justify-between items-cente bg-neutral-900 rounded-t-4xl p-4 ">
                <div className="flex justify-start items-center gap-2">
                    <Button className="rounded-4xl px-3 text-neutral-900 font- text-[16px] font-geist bg-neutral-100 border border-neutral-300 hover:bg-neutral-300"
                        onClick={() => {
                            const nextIndex = (patternIndex + 1) % patternType.length;
                            setPatternIndex(nextIndex);
                            updateConfig({ pattern: patternType[nextIndex].lable.toLowerCase() });
                            console.log(config)
                        }}
                    >{patternType[patternIndex].icon}   {patternType[patternIndex].lable}
                    </Button>
                    <Button className="rounded-full text-neutral-100 font- text-[16px] font-geist bg-neutral-800 border border-neutral-700 size-8"
                        onClick={() => { resetConfig() }}><RotateCw className="size-4" strokeWidth={1} /></Button>
                </div>
                <Tooltip>
                    <TooltipTrigger render={
                        <Button className="relative flex justify-center items-center rounded-4xl text-neutral-100 font- text-[16px] font-geist bg-neutral-800 border border-neutral-700 overflow-hidden hover:border-neutral-800 transition-color duration-300">
                            <Bookmark /> Bookmark
                            <span className="absolute inset-0 w-full h-full backdrop-blur-xs opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                        </Button>} />
                    <TooltipContent>
                        <p>This feature is coming soon</p>
                    </TooltipContent>
                </Tooltip>
            </SidebarHeader>
            <SidebarContent className="min-h-0 overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-neutral-800  flex flex-col justify-start p-4 bg-neutral-900  ">
                <SidebarGroup className="flex gap-2 justify-center items-center">
                    {patternParameters
                        .filter((parameter) => parameter.component === "slider")
                        .filter((parameter) => parameter.types.includes(patternType[patternIndex].lable.toLowerCase()))
                        .map((parameter) => (

                            <div key={parameter.lable} className="flex w-full max-w-sm flex-col gap-3">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span className="text-neutral-400">{parameter.lable}</span>
                                    <span className="tabular-nums text-neutral-100">{config[parameter.key]}</span>
                                </div>
                                <RangeSlider value={config[parameter.key]} onValueChange={(val) => updateConfig({ [parameter.key]: val })} step={parameter.step} min={parameter.min} max={parameter.max} aria-label="Value" className="bg-neutral-800" />
                            </div>
                        ))}

                </SidebarGroup>
                <SidebarGroup className="flex flex-col gap-2 justify-center items-center">
                    {patternParameters
                        .filter((parameter) => parameter.component === "color")
                        .map((parameter) => (

                            <div key={parameter.lable} className="w-full">
                                <span className="justify-start text-neutral-400 text-sm w-full">{parameter.lable}</span>
                                <div className="flex justify-between items-center w-full p-1 px-2 rounded-4xl hover:bg-neutral-800">
                                    <input
                                        type="color"
                                        className="
                                        size-8
                                        appearance-none
                                        rounded-full
                                        border-1 border-neutral-700

                                        [&::-webkit-color-swatch-wrapper]:rounded-full
                                        [&::-webkit-color-swatch]:rounded-full
                                        [&::-webkit-color-swatch]:border-0"
                                        style={{
                                            backgroundColor: config[parameter.key],
                                        }}
                                        value={config[parameter.key]}
                                        onChange={(val) => updateConfig({ [parameter.key]: val.target.value })}
                                    />

                                    <a className="text-neutral-100">{config[parameter.key]}</a>
                                </div>
                            </div>
                        ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="flex flex-row justify-between items-center bg-neutral-900 p-4 rounded-b-4xl">
                <Button className="rounded-4xl text-neutral-100  font-geist bg-neutral-800 border border-neutral-700 overflow-hidden"
                    onClick={generateRandom}>
                    <DicesIcon />
                    Randomize
                </Button>
                {/* 
                <ButtonGroup className="rounded-4xl text-neutral-100 font- text-[16px] font-geist bg-neutral-800 border border-neutral-700 overflow-hidden">
                    <Button className="bg-neutral-800 border-r-neutral-700">Copy Pattern</Button>
                    <Button className="bg-neutral-800"><ChevronDown /></Button>
                </ButtonGroup> */}
                <Button className="flex justify-center items-center rounded-4xl bg-neutral-800 border-neutral-700"
                    onClick={handleCopy}><Copy /> Copy Pattern</Button>
            </SidebarFooter>
        </Sidebar>
    )
}

