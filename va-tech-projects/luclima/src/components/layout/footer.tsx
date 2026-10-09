import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function Footer() {
    return (
        <footer id="footer" className="bg-black text-white py-24 border-t border-white/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Info */}
                    <div className="lg:col-span-1">
                        <Logo className="mb-8 scale-110 origin-left" />
                        <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                            Especialistas em climatização, higienização e manutenção técnica em Angola.
                            Soluções profissionais para o seu conforto térmico.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Serviços */}
                    <div>
                        <h4 className="font-serif text-2xl font-bold mb-8 uppercase tracking-widest text-black">Serviços</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Instalação de AC', href: '/servicos' },
                                { name: 'Manutenção Preventiva', href: '/servicos' },
                                { name: 'Higienização Química', href: '/servicos' },
                                { name: 'Sistemas Centrais', href: '/servicos' },
                                { name: 'Dedetização', href: '/servicos' },
                                { name: 'Consultoria Energética', href: '/servicos' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-gray-400 hover:text-white text-lg transition-colors font-medium">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Empresa */}
                    <div>
                        <h4 className="font-serif text-2xl font-bold mb-8 uppercase tracking-widest text-black">Empresa</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Sobre Nós', href: '/sobre' },
                                { name: 'Portfólio', href: '/portfolio' },
                                { name: 'Blog / Dicas', href: '/blog' },
                                { name: 'Área de Cliente', href: '/internauta' },
                                { name: 'Recrutamento', href: '/contacto' },
                                { name: 'Contacto', href: '/contacto' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-gray-400 hover:text-white text-lg transition-colors font-medium">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contacto & Suporte */}
                    <div>
                        <h4 className="font-serif text-2xl font-bold mb-8 uppercase tracking-widest text-black">Contacto</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start space-x-4 text-gray-400">
                                <Mail size={20} className="mt-1 flex-shrink-0 text-white" />
                                <span className="text-lg">geral@luclima.com</span>
                            </li>
                            <li className="flex items-start space-x-4 text-gray-400">
                                <Phone size={20} className="mt-1 flex-shrink-0 text-white" />
                                <span className="text-lg">+244 972 621 774</span>
                            </li>
                            <li className="flex items-start space-x-4 text-gray-400">
                                <MapPin size={20} className="mt-1 flex-shrink-0 text-white" />
                                <span className="text-lg">Luanda, Angola <br />Talatona, Via AL4</span>
                            </li>
                            <li className="flex items-start space-x-4 text-gray-400">
                                <MessageSquare size={20} className="mt-1 flex-shrink-0 text-white" />
                                <span className="text-lg font-bold text-black">Suporte 24/7 Ativo</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 text-sm font-bold uppercase tracking-[0.2em]">
                    <p>&copy; {new Date().getFullYear()} Luclima Prestação de Serviços. Todos os direitos reservados.</p>
                    <div className="flex space-x-8">
                        <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
                        <Link href="/privacidade" className="hover:text-white transition-colors">Termos de Uso</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
