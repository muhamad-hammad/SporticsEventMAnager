'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function OlympiadHomePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="container mx-auto px-4 py-20 relative z-10 text-center">
                        <div className="mb-8">
                            <span className="text-6xl mb-4 block">🏅</span>
                            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                                OLYMPIAD 2026
                            </h1>
                            <p className="text-2xl text-blue-100 font-light mb-8">Compete, Lead, Triumph</p>
                        </div>

                        <Link
                            href="/olympiad/register"
                            className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200 mb-8"
                        >
                            Register Now
                        </Link>

                        <CountdownTimer />

                        <p className="mt-8 text-blue-200 text-lg">Registration ends on: February 1, 2026</p>
                    </div>
                </div>

                {/* About Section */}
                <div className="container mx-auto px-4 py-16 mb-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">WHAT IS FAST OLYMPIAD?</h2>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            FAST Olympiad 2026 is the annual flagship sports event hosted by FAST University, bringing together athletes and enthusiasts from universities, colleges, and local clubs across Karachi. This exciting five-day event, happening from February 3rd to February 7th, 2026, is a dynamic showcase of outdoor sports, indoor games, and e-sports.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            With a wide range of competitions, participants have the chance to demonstrate their skills, teamwork, and passion for sports. More than just a competition, FAST Olympiad celebrates the spirit of unity, excellence, and the vibrant energy of youth.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Whether you're an athlete ready to compete, a gaming enthusiast looking for thrills, or a supporter cheering from the sidelines, FAST Olympiad offers something for everyone. Join us for this unforgettable experience and be part of a community that thrives on passion and sportsmanship.
                        </p>
                    </div>
                </div>

                {/* Vision Section */}
                <div className="bg-gray-900 text-white py-20 mb-16">
                    <div className="container mx-auto px-4 text-center">
                        <span className="text-6xl mb-6 block">🎯</span>
                        <h2 className="text-4xl font-bold mb-8">Our Vision</h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            To create a dynamic arena where passion meets excellence, uniting university students, local clubs, and sports enthusiasts. Our event celebrates athleticism, fosters teamwork, and strengthens bonds within and beyond institutions, inspiring the next generation of champions.
                        </p>
                    </div>
                </div>

                {/* Partners Section */}
                <div className="container mx-auto px-4 py-16 mb-20 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12">OUR PARTNERS</h2>
                    <div className="flex flex-wrap justify-center gap-8 items-center">
                        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 max-w-sm w-full">
                            <h3 className="text-xl font-bold text-gray-400 mb-2 uppercase tracking-wider">Title Sponsor</h3>
                            <p className="text-2xl font-bold text-blue-600">DhoopmeinChowmein</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-white pt-16 pb-8">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-blue-400">Contact Us</h3>
                                <p className="text-gray-300 text-lg">+92 312 0323690</p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-blue-400">About the Developers</h3>
                                <ul className="text-gray-300 space-y-2">
                                    <li>Syed Muhammad Shubair haider</li>
                                    <li>Muhammad Ayesh</li>
                                    <li>Muhammad hammad</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-blue-400">Repository</h3>
                                <a href="#" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
                                    <span className="mr-2">Star on GitHub</span>
                                    <span className="bg-gray-800 px-2 py-1 rounded text-sm">6</span>
                                </a>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                            <p>&copy; 2026 Sportics | All rights reserved</p>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
}

function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const targetDate = new Date('2026-02-01T00:00:00');

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex justify-center gap-4 md:gap-8 mt-12">
            <TimeBox value={timeLeft.days} label="days" />
            <TimeBox value={timeLeft.hours} label="hours" />
            <TimeBox value={timeLeft.minutes} label="minutes" />
            <TimeBox value={timeLeft.seconds} label="seconds" />
        </div>
    );
}

function TimeBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 w-20 md:w-24 h-20 md:h-24 flex items-center justify-center border border-white/20">
                <span className="text-3xl md:text-4xl font-bold text-white">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-blue-200 text-sm mt-2 uppercase tracking-wider">{label}</span>
        </div>
    );
}
