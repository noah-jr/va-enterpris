"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyAudioPlayerProps {
    recordingUrl: string;
    emergencyId: string;
    className?: string;
}

export const EmergencyAudioPlayer: React.FC<EmergencyAudioPlayerProps> = ({
    recordingUrl,
    emergencyId,
    className
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
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

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newVolume = parseFloat(e.target.value);
        audio.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            audio.volume = 0;
            setIsMuted(true);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `${process.env.NEXT_PUBLIC_API_URL}${recordingUrl}`;
        link.download = `emergency_${emergencyId}_recording.m4a`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={cn("bg-background border border-border p-4 rounded-lg tactical-panel", className)}>
            <audio ref={audioRef} src={`${process.env.NEXT_PUBLIC_API_URL}${recordingUrl}`} />

            <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                {/* Time Display */}
                <div className="flex items-center gap-2 min-w-[100px]">
                    <span className="text-xs font-mono font-bold text-foreground">
                        {formatTime(currentTime)}
                    </span>
                    <span className="text-xs font-mono opacity-40">/</span>
                    <span className="text-xs font-mono opacity-60">
                        {formatTime(duration)}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 relative">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div
                        className="absolute top-0 left-0 h-1 bg-primary rounded-full pointer-events-none"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                    title="Download Recording"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* Waveform Indicator */}
            <div className="mt-3 flex items-center gap-1 h-8 opacity-30">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-primary rounded-full transition-all"
                        style={{
                            height: `${Math.random() * 100}%`,
                            opacity: i / 40 < (currentTime / duration) ? 1 : 0.3
                        }}
                    />
                ))}
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs opacity-50">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="font-mono uppercase tracking-wider">GRAVAÇÃO_EMERGÊNCIA</span>
            </div>
        </div>
    );
};
