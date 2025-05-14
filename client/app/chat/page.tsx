import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageSquare, Bell, Sparkles, PlusCircle, Search } from "lucide-react";
import ChatMenu from '@/components/chat/ChatMenu';

function Page() {
return (
    <section className='bg-base-100 min-h-screen w-screen bg-gradient-to-br'>
    <ChatMenu />
    </section>
)
}

export default Page
