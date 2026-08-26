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
import { useEffect, useState } from "react"
import { useGridConfig } from "@/app/context/GridConfigContext"
import { toast } from "../toast";
import { getPatternCSS } from "@/app/utils.ts/pattern-utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { PatternConfig } from "@/app/types/grid-config"
import { driver } from "driver.js"
import "driver.js/dist/driver.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../dropdown-menu"

export function MainSidebar() {

    const [value, setValue] = useState(100)

    const [patternIndex, setPatternIndex] = useState(0)

    type PatternType = "dots" | "grid" | "striped"

    type PatternToggleOptionsType = {
        id: number,
        lable: string,
        name: PatternType,
        icon: React.ReactNode,
        function: () => void
    }

    const patternToggleOptions: PatternToggleOptionsType[] = [
        {
            id: 0,
            lable: "Dots",
            name: "dots",
            icon: <Donut />,
            function: () => updateConfig({ pattern: "dots" })
        },
        {
            id: 1,
            lable: "Striped",
            name: "striped",
            icon: <LineChart />,
            function: () => updateConfig({ pattern: "striped" })
        },
        {
            id: 2,
            name: "grid",
            lable: "Grid",
            icon: <Diamond />,
            function: () => updateConfig({ pattern: "grid" })
        }
    ]


    type NumericKeys<T> = {
        [K in keyof T]: T[K] extends number ? K : never
    }[keyof T];

    type PatternParametersType = {
        key: NumericKeys<PatternConfig>,
        lable: string,
        types: PatternType[],
        component: string,
        min?: number,
        max?: number,
        step?: number,
        unit?: string,
        function?: () => void
    }

    const patternParameters: PatternParametersType[] = [
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
        }
    ]

    type StringKeys<T> = {
        [K in keyof T]: T[K] extends string ? K : never
    }[keyof T];

    type ColorParametersType = {
        key: StringKeys<PatternConfig>,
        lable: string,
        types: PatternType[],
        component: string
    }

    const colorParameters: ColorParametersType[] = [
        {
            key: "primaryColour",
            lable: "Primary Colour",
            types: ["dots", "striped", "grid"],
            component: "color"
        },
        {
            key: "backgroundColour",
            lable: "Background Colour",
            types: ["dots", "striped", "grid"],
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
    const [selectedPreset, setSelectedPreset] = useState<string>("Presets")

    function handlePresetSelector(preset: PresetsType) {


        setSelectedPreset(preset.label)
        console.log("Preset Selected", selectedPreset)


        updateConfig({ 'primaryColour': `${preset.config.primaryColour}` },)
        updateConfig({ 'backgroundColour': `${preset.config.backgroundColour}` },)
        updateConfig({ 'pattern': `${preset.config.pattern}` })
        updateConfig({ 'scale': preset.config.scale })
        updateConfig({ 'spacing': preset.config.spacing })
        updateConfig({ 'opacity': preset.config.opacity })
        updateConfig({ 'primaryRotation': preset.config.primaryRotation })
        updateConfig({ 'secondaryRotation': preset.config.secondaryRotation })

        console.log(config)
    }





    const driverObj = driver({

        showProgress: true,
        steps: [
            {
                element: ".pattern-toggle",
                popover: {
                    title: "Pattern Toggle",
                    description: "Toggle between 'dots', 'striped' and 'grid/cross' pattern.",
                }
            },
            {
                element: ".pattern-control",
                popover: {
                    title: "Controls pannel",
                    description: "Use these controls to adjust the pattern properties like scale, spacing, opacity and rotation",
                }
            },
            {
                element: ".pattern-color",
                popover: {
                    title: "Colors pannel",
                    description: "Use these controls to adjust the pattern colors.",
                }
            },
            {
                element: ".pattern-copy",
                popover: {
                    description: "Copy the CSS style of the pattern. ready to paste in your inline style ",
                    side: "top",
                    align: "end"
                }
            },
            {
                popover: {
                    title: "Happy creating!",
                    description: "And that is all, go ahead and start creating patterns for your projects."
                }
            }
        ]

    });


    useEffect(() => {

        const hasVisited = localStorage.getItem("hasVisited")

        if (!hasVisited) {
            localStorage.setItem("hasVisited", "true")
            driverObj.drive();
        }
    }, [])



    return (
        <Sidebar className="flex flex-col  justify-between rounded  rounded-4xl " variant="floating" collapsible="icon">
            <SidebarHeader className="flex flex-row justify-between items-cente bg-neutral-900 rounded-t-4xl p-4 ">
                <div className="flex justify-start items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button className="pattern-toggle rounded-4xl px-3 text-neutral-900 font- text-[16px] font-geist bg-neutral-100 border border-neutral-300 hover:bg-neutral-300"
                                onClick={() => {
                                    const nextIndex = (patternIndex + 1) % patternToggleOptions.length;
                                    setPatternIndex(nextIndex);
                                    updateConfig({ pattern: patternToggleOptions[nextIndex].name });
                                    console.log(config)
                                }}
                            >{patternToggleOptions[patternIndex].icon}   {patternToggleOptions[patternIndex].lable}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Toggle pattern type
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button className="rounded-full text-neutral-100 font- text-[16px] font-geist bg-neutral-800 border border-neutral-700 size-8"
                                onClick={() => { resetConfig() }}><RotateCw className="size-4" strokeWidth={1} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset the pattern</TooltipContent>
                    </Tooltip>
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
            <SidebarContent className=" min-h-0 overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-neutral-800  flex flex-col justify-start p-4 bg-neutral-900  ">
                <SidebarGroup className="pattern-control flex gap-2 justify-center items-center">
                    {patternParameters
                        .filter((parameter) => parameter.component === "slider")
                        .filter((parameter) => parameter.types.includes(patternToggleOptions[patternIndex].name))
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
                <SidebarGroup className="pattern-color flex flex-col gap-2 justify-center items-center">
                    {colorParameters
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
                {/* <Button className="rounded-4xl text-neutral-100  font-geist bg-neutral-800 border border-neutral-700 overflow-hidden"
                    onClick={generateRandom}>
                    <DicesIcon />
                    Presets
                </Button> */}
                <DropdownMenu>
                    <ButtonGroup className="rounded-4xl text-neutral-100 font- text-[16px] font-geist bg-neutral-800 border border-neutral-700 overflow-hidden">
                        <Button className="bg-neutral-800 border-r-neutral-700">{selectedPreset}</Button>
                        <DropdownMenuTrigger>
                            <Button className="bg-neutral-800"><ChevronDown /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-neutral-800 border border-neutral-700">
                            <DropdownMenuGroup className="text-neutral-200">
                                {presets.map((preset, idx) => (
                                    <DropdownMenuItem
                                        className="transition-all duration-300 ease-in-out"
                                        onClick={() => handlePresetSelector(preset)}>{preset.label}</DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </ButtonGroup>
                </DropdownMenu>
                <Button className="pattern-copy flex justify-center items-center rounded-4xl bg-neutral-800 border-neutral-700"
                    onClick={handleCopy}><Copy /> Copy Pattern</Button>
            </SidebarFooter>
        </Sidebar>
    )
}




type PresetsType = {
    label: string,
    config: PatternConfig
}


const presets: PresetsType[] = [
    {
        label: "Dot Preset 1",
        config: {
            backgroundColour: "#f8fadb",
            opacity: 1,
            pattern: "dots",
            primaryColour: "#b1dd8c",
            primaryRotation: 135,
            scale: 1.2,
            secondaryRotation: 45,
            spacing: 10,
        },
    },
    {
        label: "Striped Preset 1",
        config: {
            backgroundColour: "#000000",
            opacity: 0.2,
            pattern: "striped",
            primaryColour: "#ffffff",
            primaryRotation: 131,
            scale: 0.1,
            secondaryRotation: 45,
            spacing: 10,
        },
    },
    {
        label: "Striped Preset 2",
        config: {
            backgroundColour: "#121212",
            opacity: 0.5,
            pattern: "striped",
            primaryColour: "#000000",
            primaryRotation: 131,
            scale: 1.2,
            secondaryRotation: 45,
            spacing: 18,
        },
    },
    {
        label: "Grid Preset 1",
        config: {
            backgroundColour: "#121212",
            opacity: 0.1,
            pattern: "grid",
            primaryColour: "#ffffff",
            primaryRotation: 131,
            scale: 0.1,
            secondaryRotation: 41,
            spacing: 78,
        },
    },
    {
        label: "Grid Preset 2",
        config: {
            backgroundColour: "#ebebeb",
            opacity: 0.1,
            pattern: "grid",
            primaryColour: "#232323",
            primaryRotation: 131,
            scale: 0.8,
            secondaryRotation: 41,
            spacing: 10,
        },
    },
];

// const presetList = [
//     {
//         lable: "Dot Preset 1",
//         config: {

//         }

//     }
// ]



//Dot Preset 1
// backgroundColour: "#f8fadb"

// opacity: 1

// pattern: "dots"

// primaryColour: "#b1dd8c"

// primaryRotation: 135

// scale: 1.2

// secondaryRotation: 45

// spacing: 10





//Striped Preset 1
// backgroundColour: "#000000"

// opacity: 0.2

// pattern: "striped"

// primaryColour: "#ffffff"

// primaryRotation: 131

// scale: 0.1

// secondaryRotation: 45

// spacing: 10



//Striped Preset 2
// backgroundColour: "#121212"

// opacity: 0.5

// pattern: "striped"

// primaryColour: "#000000"

// primaryRotation: 131

// scale: 1.2

// secondaryRotation: 45

// spacing: 18



//Grid Preset 1
// backgroundColour: "#121212"

// opacity: 0.1

// pattern: "grid"

// primaryColour: "#ffffff"

// primaryRotation: 131

// scale: 0.1

// secondaryRotation: 41

// spacing: 78



//Grid Preset 2

// backgroundColour: "#ebebeb"

// opacity: 0.1

// pattern: "grid"

// primaryColour: "#232323"

// primaryRotation: 131

// scale: 0.8

// secondaryRotation: 41

// spacing: 10