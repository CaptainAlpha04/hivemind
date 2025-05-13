import React from 'react'
import Link from 'next/link'
import Image from 'next/image' 

function Header() {
return (
    <header className="w-full py-4 px-24 flex items-center justify-between z-20 backdrop-blur-md fixed">
    <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <Image src="/images/logo.png" alt="HiveMind Logo" width={36} height={36} className="object-contain w-8 h-8" />
        </div>
        <span className="text-base-content font-extralight text-xl tracking-wide">Hive<b className='font-extrabold'>Mind</b></span>
    </div>
    <nav className="hidden md:flex space-x-8">
        <Link href="/home" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium hover:bg-white/10 hover:backdrop-blur-md px-3 py-1 rounded-lg">Home</Link>
        <Link href="/explore" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium hover:bg-white/10 hover:backdrop-blur-md px-3 py-1 rounded-lg">Explore</Link>
        <Link href="/contact" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium hover:bg-white/10 hover:backdrop-blur-md px-3 py-1 rounded-lg">Contact</Link>
    </nav>

</header>

)
}

export default Header
