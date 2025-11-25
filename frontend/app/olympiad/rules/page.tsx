'use client';

import { useState } from 'react';

export default function RulesPage() {
    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">SOPs and Regulations</h1>
                    <p className="text-xl text-gray-600">Official Guidelines for Sportics Olympiad</p>
                </div>

                {/* General Guidelines Section */}
                <div className="space-y-8 mb-16">
                    <Section title="1. Registration Process">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Participants must register online via the official Olympiad website before the deadline.</li>
                            <li>After registration, participants will receive an email confirming the receipt of their registration form.</li>
                            <li>Registration payments will be reviewed and approved by the Sportics Committee.</li>
                            <li>Once the payment is approved, a confirmation email will be sent to participants, confirming their registration.</li>
                        </ul>
                    </Section>

                    <Section title="2. Team Registration">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>For team sports, only the designated team leader will complete the registration process.</li>
                            <li>The team leader must provide accurate details of all team members during registration.</li>
                            <li>Team members are required to confirm their participation with the team leader.</li>
                            <li>Substitution of team members after registration will not be allowed unless explicitly approved by the organizing committee.</li>
                        </ul>
                    </Section>

                    <Section title="3. General Guidelines for Participants">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>All participants must wear appropriate sports attire during games.</li>
                            <li>Participants must adhere to the rules and guidelines of each sport.</li>
                            <li>Misconduct, foul language, or unsportsmanlike behavior will lead to disqualification.</li>
                            <li>Participants are required to arrive at least 30 minutes before the scheduled match time.</li>
                            <li>Team leaders are responsible for ensuring their team’s presence at the venue on time.</li>
                            <li>All playing participants must be present for their scheduled matches on time, or else the opponent will be awarded a walkover victory unless the organizing committee grants a special exception.</li>
                        </ul>
                    </Section>

                    <Section title="4. E-Sports Guidelines">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>All players must use their gaming accounts and log in before the match begins.</li>
                            <li>Players must follow the specific rules for each game (e.g., PUBG, Valorant).</li>
                            <li>Cheating, hacking, or use of unfair advantages will result in immediate disqualification.</li>
                            <li>The decision of the event referees for e-sports will be final and binding.</li>
                        </ul>
                    </Section>

                    <Section title="5. Conduct and Discipline">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Participants and spectators must maintain discipline at all times.</li>
                            <li>Alcohol, drugs, vapes, cigarettes, or any prohibited substances are strictly forbidden on campus.</li>
                            <li>Any disputes must be reported to the organizing committee immediately.</li>
                            <li>The decision of referees and the organizing committee will be considered final.</li>
                        </ul>
                    </Section>

                    <Section title="6. Safety and Security">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Lost and found items must be reported to the help desk immediately.</li>
                            <li>Participants are responsible for their personal belongings.</li>
                        </ul>
                    </Section>

                    <Section title="7. Emergency Handling">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>In case of medical emergencies, participants must contact the nearest organizer or medical staff.</li>
                        </ul>
                    </Section>

                    <Section title="8. Cancellation or Postponement of Events">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>The organizer reserves the right to cancel or postpone events due to unforeseen circumstances.</li>
                            <li>Participants will be notified via email or SMS regarding any changes.</li>
                        </ul>
                    </Section>

                    <Section title="9. Photography and Media Coverage">
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>By registering for the event, participants consent to photography and video coverage during the event.</li>
                            <li>The organizing committee reserves the right to use photos and videos for promotional purposes.</li>
                        </ul>
                    </Section>
                </div>

                {/* Sports Rules Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">RULES FOR ALL SPORTS</h2>
                    <SportsRules />
                </div>

                {/* Footer Section */}
                <div className="border-t pt-12 mt-12">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
                        </div>
                    </div>
                    <div className="text-center text-gray-500 text-sm">
                        © 2025 Sportics | All rights reserved
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
            {children}
        </div>
    );
}

function SportsRules() {
    const [activeSport, setActiveSport] = useState('Futsal');

    const sports = [
        'Futsal', 'Basketball', 'Cricket', 'Volleyball',
        'Throwball', 'Table Tennis', 'Badminton'
    ];

    const rulesData: Record<string, any> = {
        Futsal: {
            color: 'bg-blue-600',
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Referees:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>The game would consist of two refs: one who will be the side ref and one who will be the main ref.</li>
                            <li>The main referee&apos;s decision will be the final decision (Arguments could lead to a straight red card).</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Team Composition:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Each team consists of 5 players on the field, including a goalkeeper.</li>
                            <li>Teams can have a maximum of 7 substitutes.</li>
                            <li>Substitutions can be made at any time and do not require stoppage of play.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Match Duration:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>A match is divided into two halves, each lasting 15 minutes (running clock).</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Scoring:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>A goal is scored when the entire ball crosses the goal line between the goalposts and under the crossbar.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Freekicks and Penalties:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Free kicks are awarded for fouls committed outside the penalty area.</li>
                            <li>A direct free kick is awarded for serious fouls and can be taken directly at the goal.</li>
                            <li>An indirect free kick is awarded for minor fouls; the ball must touch another player before a goal can be scored.</li>
                            <li>A penalty kick is awarded for a foul committed inside the penalty area. The kick is taken from a designated penalty mark.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Goalkeeper Rules:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Goalkeepers cannot hold the ball for more than 4 seconds.</li>
                            <li>Goalkeepers cannot receive the ball directly (in hand) from a teammate&apos;s foot after it has been intentionally passed to them.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Disciplinary Actions (Cards):</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li><strong>Yellow Cards:</strong> A warning for misconduct.</li>
                            <li><strong>Red Cards:</strong> A player receiving 2 yellow cards is sent off for 3 minutes. If a player receives a straight red card, they will be benched for the remainder of the game and cannot be substituted.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Point System:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Each win consists of 3 points and a draw results in 1 point for each team.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Walkover Rule (Forfeit):</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li><strong>Time Limit:</strong> If a team fails to show up within 15 minutes of the scheduled start time, they will forfeit the game.</li>
                            <li><strong>Result:</strong> The opposing team will be awarded a win by forfeit, with a score of 3-0 recorded in their favor.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        Basketball: {
            color: 'bg-orange-600',
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Team Composition:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>5 players on court per team.</li>
                            <li>Maximum 7 substitutes allowed.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Match Duration:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>4 quarters of 10 minutes each.</li>
                            <li>2 minutes break between quarters, 10 minutes halftime.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Scoring:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Inside arc: 2 points.</li>
                            <li>Outside arc: 3 points.</li>
                            <li>Free throw: 1 point.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Fouls:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>5 personal fouls result in ejection.</li>
                            <li>Team foul penalty applies after 4 fouls in a quarter.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        Cricket: {
            color: 'bg-green-700',
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Format:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Tape ball cricket.</li>
                            <li>8 overs per innings.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Team Composition:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>8 players per team.</li>
                            <li>3 substitutes allowed.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Bowling Rules:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Maximum 2 overs per bowler.</li>
                            <li>Wide ball and No ball result in 1 extra run + extra ball.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        Volleyball: {
            color: 'bg-yellow-600',
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Format:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Best of 3 sets.</li>
                            <li>First 2 sets to 25 points, 3rd set (if needed) to 15 points.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Team Composition:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>6 players on court.</li>
                            <li>Rotation rules apply.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        Throwball: {
            color: 'bg-pink-600',
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Format:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Best of 3 sets, 15 points each.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Rules:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Service must be thrown from behind the baseline.</li>
                            <li>Ball must be caught with both hands and returned immediately.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        'Table Tennis': {
            color: 'bg-indigo-600',
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Format:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Best of 3 games (or 5 for finals).</li>
                            <li>Game to 11 points.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Service:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>2 serves each, alternating.</li>
                            <li>Ball must be tossed at least 6 inches.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        Badminton: {
            color: 'bg-teal-600',
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Format:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Best of 3 sets to 21 points.</li>
                            <li>Rally point scoring system.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Faults:</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Shuttle landing out.</li>
                            <li>Touching the net with racket or body.</li>
                        </ul>
                    </div>
                </div>
            )
        }
    };

    return (
        <div>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {sports.map((sport) => (
                    <button
                        key={sport}
                        onClick={() => setActiveSport(sport)}
                        className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-1 ${activeSport === sport
                            ? `${rulesData[sport].color} text-white shadow-lg scale-105`
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {sport}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                <div className={`${rulesData[activeSport].color} px-6 py-4 transition-colors duration-300`}>
                    <h3 className="text-2xl font-bold text-white">{activeSport} Rules</h3>
                </div>
                <div className="p-6">
                    {rulesData[activeSport].content}
                </div>
            </div>
        </div>
    );
}
