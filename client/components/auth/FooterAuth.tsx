import Link from 'next/link';

export default function FooterAuth() {
    return (
        <footer className="w-full py-6 px-6 z-20 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <span className="text-slate-400 text-sm">© 2025 HiveMind. All rights reserved.</span>
                </div>
                <div className="flex space-x-8">
                    <Link href="/privacy" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Terms of Service</Link>
                    <Link href="/contact" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Contact</Link>
                </div>
            </div>
        </footer>
    );
}