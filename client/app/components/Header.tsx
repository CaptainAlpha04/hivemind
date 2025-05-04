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
        <Link href="/Home" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium hover:bg-white/10 hover:backdrop-blur-md px-3 py-1 rounded-lg">Home</Link>
        <Link href="/Explore" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium hover:bg-white/10 hover:backdrop-blur-md px-3 py-1 rounded-lg">Explore</Link>
        <Link href="/Support" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium hover:bg-white/10 hover:backdrop-blur-md px-3 py-1 rounded-lg">Support</Link>
    </nav>

    {/* <div className="hidden md:flex space-x-4">
        <button>
            <Link href="/Home" className="text-teal-300 transition-colors duration-300 font-medium bg-white/10 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-teal-900 hover:text-teal-200">Login</Link>
        </button>
        <button>
            <Link href="/Home" className="text-teal-200 transition-colors duration-300 font-medium bg-teal-900/70 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-teal-900 hover:text-teal-200">Sign up</Link>
        </button>
    </div> */}
</header>

)
}

export default Header
