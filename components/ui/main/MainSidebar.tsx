"use client"

import { CircleQuestionMark, CodeXml, DraftingCompass, MessageSquareText, Palette, Scale, SidebarClose } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "../sidebar";
import { Slider } from "../slider";
import { useState } from "react";




export default function MainSidebar() {


    const [scale, setScale] = useState<number>(0);


    return (
        <Sidebar className=" border-black text-neutral-100 w-auto">
            <SidebarHeader className="flex flex-col justify-center items-start bg-neutral-900/99 p-4">
                <a className="flex justify-center items-center gap-2 text-3xl font-thin"><SidebarClose strokeWidth={1} size={28} /> Control Pannel</a>
                <a className="text-sm font-light uppercase text-neutral-500">Edit Pattern Parameters</a>


            </SidebarHeader>
            <SidebarContent className="flex flex-col justify-center items-start gap-4 bg-neutral-900/99 border-r-black p-2 w-full overflow-hidden">
                <SidebarGroup className="flex flex-col justify-start items-start gap-4">


                    <div className="flex justify-start items-center text-xs gap-2 uppercase">
                        <DraftingCompass strokeWidth={1} />
                        Geometry
                    </div>
                    {GeometryItems.map((item, idx) => (


                        <div className="flex flex-col w-full py-2">
                            <div className="flex flex-col justify-center items-start w-full gap-4">
                                <div className="flex justify-between items-center w-full text-sm">
                                    <a>{item.title}</a>
                                    <a>40px</a>
                                </div>
                                { }
                                <Slider
                                    defaultValue={scale}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="mx-auto w-full max-w-xs"
                                />

                            </div>
                        </div>
                    ))}



                </SidebarGroup>
                <SidebarGroup className="flex flex-col justify-start items-start gap-4 w-full">

                    <div className="flex justify-start items-center text-xs gap-2 uppercase">
                        <Palette strokeWidth={1} />
                        Colors
                    </div>
                    <div className="flex flex-col justify-start items-center gap-4 w-full text-sm font-light">
                        <div className="flex justify-between items-center p-2 border border-neutral-800 w-full">
                            <a className="upeercase">Primary</a>
                            <div className="flex justify-center items-center gap-2">
                                #000000
                                <input type="color" className="w-[25px] h-[25px]" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-2 border border-neutral-800 w-full">
                            <a className="upeercase">Secondary</a>
                            <div className="flex justify-center items-center gap-2">
                                #000000
                                <input type="color" className="w-[25px] h-[25px]" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-start w-full gap-4">
                            <div className="flex justify-between items-center w-full text-sm">
                                <a>Opacity</a>
                                <a>40px</a>
                            </div>
                            { }
                            <Slider
                                defaultValue={scale}
                                min={0}
                                max={100}
                                step={1}
                                className="mx-auto w-full max-w-xs"
                            />

                        </div>

                    </div>

                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter className="flex flex-col justify-center items-start bg-neutral-900/99 p-4 border-t-black">
                <div className="w-full border border-neutral-800 flex justify-center gap-4 items-center p-4">
                    <CodeXml strokeWidth={1} />
                    Get Code
                </div>
                <div className="flex justify-between items-center w-full text-xs font-thin text-neutral-400 p-2">
                    <div className="flex justify-start items-center gap-2">
                        <CircleQuestionMark size={18} strokeWidth={1} />
                        Help
                    </div>
                    <div className="flex justify-start items-center gap-2">
                        <MessageSquareText size={18} strokeWidth={1} />
                        Feedback
                    </div>

                </div>


            </SidebarFooter>

        </Sidebar>
    )
}

type GeometryItemsType = {
    title: string,
    min: number,
    max: number,

    function: (value: string) => void
}

const GeometryItems: GeometryItemsType[] = [
    {
        title: "Scale",
        min: 0,
        max: 0,
        function: () => { }
    },
    {
        title: "Rotation",
        min: 0,
        max: 0,
        function: () => {
        }
    },
    {
        title: "Spacing",
        min: 0,
        max: 0,
        function: () => { }
    }
]


