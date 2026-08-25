// "use client"
// import { useSelector } from "@/app/context/ViewSelectorContext";
// import { cn } from "@/lib/utils";
// import { CircleQuestionMark, IdCard, LaptopMinimalCheck, MessageSquareOff, ReceiptTurkishLira, SquareUserRound, Star, User, UserKey } from "lucide-react";
// import Link from "next/link";





// export default function MainNavbar() {


//     const { selected, setSelected } = useSelector<SecectorCon();


//     return (
//         <nav className="fixed inset-0 flex justify-between items-center bg-neutral-900 w-full border-b border-neutral-800 h-[50px] z-100 px-4 text-white">
//             <div className="text-2xl font-thin">Pattern Generator</div>
//             <div className="flex justify-start items-center gap-4">

//                 <div className="flex justify-center items-center bg-neutral-800 gap-2 p-1 border border-neutral-950">
//                     {viewSelectorItems.map((item, idx) => (
//                         <div key={idx} className={cn(selected === item.lable && "bg-black", " p-1 cursor-pointer rounded-xs")}
//                             onClick={() => setSelected(item.lable)}>
//                             {item.icon}
//                         </div>
//                     ))}
//                 </div>
//                 {navItems.map((item, idx) => (
//                     <Link key={idx} href="#">{item.icon}</Link>
//                 ))}


//                 <div className="relative flex justify-center items-center gap-2 bg-black/20 border border-neutral-800 p-2 text-white">
//                     <UserKey size={16} strokeWidth={2} />
//                     Log in
//                     <span className="absolute inset-0 w-full h-full bg-none hover:backdrop-blur-xs transition-all duration-300 ease-in-out"></span>
//                 </div>

//             </div>

//         </nav>
//     )
// }


// const navItems = [
//     {
//         lable: "FAQs",
//         icon: <CircleQuestionMark strokeWidth={1} size={20} />
//     },
//     {
//         lable: "Star",
//         icon: <Star strokeWidth={1} size={20} />
//     }
// ]



// type viewSelectorType = {
//     lable: string,
//     icon: React.ReactElement
// }

// const viewSelectorItems = [
//     {
//         lable: "Blank",
//         icon: <MessageSquareOff strokeWidth={1} size={16} />
//     },
//     {
//         lable: "Hero",
//         icon: <LaptopMinimalCheck strokeWidth={1} size={16} />
//     },
//     {
//         lable: "Card",
//         icon: <IdCard strokeWidth={1} size={16} />
//     }
// ]