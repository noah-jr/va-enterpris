'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
    recordingId: string;
    fileName: string;
    audioUrl: string;
    duration: number;
    transcription?: string;
    onDownload?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    recordingId,
    fileName,
    audioUrl,
    duration,
    transcription,
    onDownload,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showTranscription, setShowTranscription] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const time = parseFloat(e.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const vol = parseFloat(e.target.value);
        audio.volume = vol;
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.volume = volume;
            setIsMuted(false);
        } else {
            audio.volume = 0;
            setIsMuted(true);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-background border border-border overflow-hidden">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Header Area */}
            <div className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-start justify-between mb-6">
                    <div className="space-y-1">
                        <span className="text-[7px] font-black text-foreground uppercase tracking-[0.4em] opacity-40">Motor_Audio</span>
                        <h4 className="font-black text-foreground tracking-tighter text-xl uppercase leading-none">{fileName}</h4>
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-30 mt-2 block font-tactical">ID: {(recordingId || '').substring(0, 12)}</span>
                    </div>
                </div>

                {/* Minimalist Visualizer Overlay */}
                <div className="flex items-end justify-between gap-px h-10 w-full opacity-20">
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-foreground"
                            style={{
                                height: `${isPlaying ? 20 + Math.random() * 80 : 10}%`,
                                opacity: currentTime / duration > i / 40 ? 1 : 0.2,
                                transition: isPlaying ? 'height 0.1s linear' : 'height 0.4s ease'
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Controls Hub */}
            <div className="p-6">
                {/* Precision Seek Bar */}
                <div className="mb-6 group relative">
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-[1px] bg-border appearance-none cursor-pointer accent-foreground outline-none"
                    />
                    <div className="flex justify-between text-[7px] font-black text-muted-foreground mt-2 uppercase tracking-[0.2em] font-tactical opacity-50">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Tactical Controls */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={togglePlay}
                            className="h-10 px-8 bg-foreground text-background flex items-center justify-center font-black text-[9px] uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            {isPlaying ? 'PAUSA' : 'TOCAR'}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-muted/50 px-4 h-10 border border-border">
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-30 font-tactical">GANHO</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-[1px] bg-border appearance-none cursor-pointer accent-foreground"
                        />
                    </div>

                    <button
                        onClick={() => setShowTranscription(!showTranscription)}
                        className="h-10 px-4 border border-border text-[8px] font-black uppercase tracking-widest hover:bg-muted transition-all"
                    >
                        {showTranscription ? 'OCULTAR_TRANS' : 'VER_TRANS'}
                    </button>
                </div>
            </div>

            {/* Text Analysis Block */}
            {showTranscription && transcription && (
                <div className="border-t border-border p-6 bg-muted/30">
                    <p className="text-[10px] text-foreground leading-relaxed font-bold uppercase tracking-tight opacity-60 border-l-2 border-foreground pl-4">
                        "{transcription}"
                    </p>
                </div>
            )}
        </div>
    );
};
