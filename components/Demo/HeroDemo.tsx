'use client';

import { AvatarCircles } from '@/components/ui/avatar-circles';
import { Button } from "@/components/ui/button"

export default function HeroDemo() {
    return (
        <section className="flex flex-col items-center text-center relative bg-none px-6 py-30 md:py-50 text-white overflow-hidden ">

            <div className="absolute inset-0 ">

            </div>

            {/* Content INSIDE orb */}

            {/* Badge */}
            <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-1 text-sm backdrop-blur">
                ⦿ Hero Section
            </span>

            {/* Heading + arrow */}
            <div className="flex items-center gap-4">
                <h1 className="font-medium tracking-tight text-5xl md:text-3xl lg:text-7xl z-10">
                    Turning Ideas into Influence
                </h1>

                {/* <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-[#3F6B54] transition hover:border-[#3F6B54] hover:bg-[#3F6B54]/10">
              <ArrowUpRight size={20} />
            </div> */}
            </div>

            {/* Description */}
            <p className="mt-8 max-w-3xl text-white/70 text-sm md:text-2xl z-10">
                Design Experts in Custom Assets and Social Media Management
            </p>

            <div className='flex flex-row justify-center items-center gap-4 w-full mt-8 z-10'>
                <Button className='relative bg-neutral-900 overflow-hidden'>Our Services</Button>
                <Button
                    className='relative bg-neutral-700 overflow-hidden'
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    Contact Us
                </Button>

            </div>

            <div className='flex flex-col justify-center items-center gap-4 mt-20'>
                <a className='text-[20px] text-zinc-400'>Trusted by founders developers and creators</a>
                <AvatarCircles numPeople={99} avatarUrls={avatars} />
            </div>


        </section>
    );
}



const avatars = [
    {
        imageUrl: "https://avatars.githubusercontent.com/u/16860528",
        profileUrl: "https://github.com/dillionverma",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/20110627",
        profileUrl: "https://github.com/tomonarifeehan",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/106103625",
        profileUrl: "https://github.com/BankkRoll",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/59228569",
        profileUrl: "https://github.com/safethecode",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/59442788",
        profileUrl: "https://github.com/sanjay-mali",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/89768406",
        profileUrl: "https://github.com/itsarghyadas",
    },
]