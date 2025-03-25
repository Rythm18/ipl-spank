'use client';

import { useState, useEffect, JSX } from 'react';
import Image from 'next/image';
import { db } from './firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

type Team = 'rcb' | 'mi' | 'csk';

interface SlapCounts {
  rcb: number;
  mi: number;
  csk: number;
}

interface AnimationState {
  rcb: boolean;
  mi: boolean;
  csk: boolean;
}

export default function Home(): JSX.Element {
  const [slaps, setSlaps] = useState<SlapCounts>({
    rcb: 1000,
    mi: 900,
    csk: 800,
  });
  const [animating, setAnimating] = useState<AnimationState>({
    rcb: false,
    mi: false,
    csk: false,
  });
  const [memeVisible, setMemeVisible] = useState<AnimationState>({
    rcb: false,
    mi: false,
    csk: false,
  });

  const [disableClick, setDisableClick] = useState<AnimationState>({
    rcb: false,
    mi: false,
    csk: false,
  });
  const [randomMeme, setRandomMeme] = useState<Record<Team, string>>({
    rcb: '',
    mi: '',
    csk: '',
  });

  useEffect(() => {
    const docRef = doc(db, 'slaps', 'br');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSlaps(docSnap.data() as SlapCounts);
      }
    });
    return () => unsubscribe();
  }, []);
  const soundMapping: Record<Team, string[]> = {
    rcb: [
      '/sounds/rcb1.mp3',
      '/sounds/all.mp3',
      '/sounds/all3.mp3',
    ],
    mi: [
      '/sounds/mi1.mp3',
      '/sounds/mi2.mp3',
      '/sounds/all.mp3',
      '/sounds/all3.mp3',
    ],
    csk: [
      '/sounds/csk1.mp3',
      '/sounds/csk2.mp3',
      '/sounds/all.mp3',
      '/sounds/all3.mp3',
    ],
  };

  // Meme arrays
  const memeMapping: Record<Team, string[]> = {
    rcb: [
      '/rcb1.webp',
      '/rcb2.webp',
      '/rcb3.webp',
      '/rcb4.webp',
      '/rcb5.webp',
      '/rcb6.jpeg',
      '/rcb7.webp',
      '/all.jpeg',
      // '/all2.jpeg',
      '/sanju.png',
    ],
    mi: [
      '/mi1.jpg',
      '/mi2.jpg',
      '/mi3.jpeg',
      '/all.jpeg',
      // '/all2.jpeg',
      '/sanju.png',
      '/mi4.webp',
    ],
    csk: [
      '/csk1.webp',
      '/csk2.webp',
      '/csk3.webp',
      '/csk4.webp',
      '/csk5.jpeg',
      '/csk6.jpeg',
      '/csk7.jpeg',
      '/all.jpeg',
      // '/all2.jpeg',
      '/sanju.png',
    ],
  };


  const sortedTeams = Object.entries(slaps).sort(([, aCount], [, bCount]) => bCount - aCount);
  const topTeam = sortedTeams[0][0] as Team;

  const crypticMessages: Record<Team, string> = {
    rcb: "Galat jagah first aa rahe!LOL",
    mi: "Yaha bhi paiso se khareed liya!",
    csk: "JAILED!",
  };

  const topMessage = crypticMessages[topTeam];

  const SOUND_PLAY_CHANCE = 0.5;

  const handleClick = async (team: Team) => {
    if (disableClick[team]) return;

    setDisableClick((prev) => ({ ...prev, [team]: true }));

    const docRef = doc(db, 'slaps', 'br');
    await updateDoc(docRef, { [team]: slaps[team] + 1 });

    setAnimating((prev) => ({ ...prev, [team]: true }));
    setTimeout(() => {
      setAnimating((prev) => ({ ...prev, [team]: false }));
    }, 600);

    const memes = memeMapping[team];
    const randomIndex = Math.floor(Math.random() * memes.length);
    setRandomMeme((prev) => ({
      ...prev,
      [team]: memes[randomIndex],
    }));

    if (Math.random() < SOUND_PLAY_CHANCE) {
      const teamSounds = soundMapping[team];
      if (teamSounds && teamSounds.length > 0) {
        const randomSoundIndex = Math.floor(Math.random() * teamSounds.length);
        const audio = new Audio(teamSounds[randomSoundIndex]);

        audio.play().catch((err) => {
          console.warn('Failed to play sound:', err);
        });
      }
    }

    setMemeVisible((prev) => ({ ...prev, [team]: true }));
    setTimeout(() => {
      setMemeVisible((prev) => ({ ...prev, [team]: false }));
      setDisableClick((prev) => ({ ...prev, [team]: false }));
    }, 1500);
  };

  const sendMemeMail = async () => {
    const mailto = 'ridhamk.j@gmail.com'
    const subject = `Meme Submission for 'Spanked'`;
    const body = 'Hey there! I have a meme for you. Here it is:';
    window
      .open(`mailto:${mailto}?subject=${subject}&body=${body}`, '_blank')
      ?.focus();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center py-10 px-4 text-gray-800">
      <h1 className="text-3xl sm:text-5xl font-bold text-center mb-10 mx-2">
        Beat your fav team's haters by spanking their fav team
      </h1>

      {/* Meme Popouts */}
      {(['rcb', 'mi', 'csk'] as Team[]).map((team) => {
        if (!memeVisible[team]) return null;
        return (
          <div key={`${team}-meme`} className="meme-popout">
            <Image
              src={randomMeme[team] || ''}
              alt={`${team.toUpperCase()} Meme`}
              width={400}
              height={400}
              className="rounded-sm max-w-full max-h-full"
            />
          </div>
        );
      })}

      <div className="flex flex-row gap-4 w-full px-4 sm:justify-center sm:gap-8">
        {(['rcb', 'mi', 'csk'] as Team[]).map((team) => (
          <div
            key={team}
            className="relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => handleClick(team)}
          >
            <div
              className={`relative rounded-full overflow-hidden shadow-lg ${
                animating[team] ? 'slap-shake' : ''
              }`}
            >
              <Image
                src={`/${team}main.avif`}
                alt={`${team.toUpperCase()} Logo`}
                width={280}
                height={280}
                className="rounded-full max-w-full"
              />
              {animating[team] && <div className="slap-burst"></div>}
            </div>
            <p className="mt-4 text-base sm:text-lg font-semibold">
              {team.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="mt-10 w-full max-w-md bg-white rounded-lg shadow-md p-6 mx-2 transition-all">
  <h2 className="text-2xl font-bold text-center mb-4">
    Spank Leaderboard
  </h2>
  
  <ul className="space-y-3 text-lg transition-all">
    {sortedTeams.map(([team, count]) => (
      <li key={team} className="flex justify-between">
        <span className="font-medium">{team.toUpperCase()}</span>
        <span>{count}</span>
      </li>
    ))}
  </ul>

  <div className="p-4 mt-6 bg-yellow-50 text-yellow-700 text-center rounded-md shadow">
    <strong>{topTeam.toUpperCase()}</strong> leads the pack!
    <p className="mt-2 text-sm italic">
      {topMessage}
    </p>
  </div>
</div>


      <footer className="mt-10 flex flex-col items-center gap-6 text-sm text-gray-600 px-4">
        <p className="text-center max-w-[300px]">
          This is just a fun project. Taking it seriously is like supporting
          Punjab Kings in IPL.
        </p>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          onClick={sendMemeMail}
        >
          Send Your Meme
        </button>
      </footer>
    </div>
  );
}
