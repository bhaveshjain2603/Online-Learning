import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { jwtDecode } from 'jwt-decode';
import { ProgressBar } from './ProgressBar';
import { WatchInterval } from './types';
import './VideoPlayer.css';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import toast from 'react-hot-toast';
import { formatTime } from './utils';

interface VideoPlayerProps {
  videoId: string;
  videoUrl: string;
}

interface DecodedToken {
  userId: string;
  exp: number;
  iat: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [watchedIntervals, setWatchedIntervals] = useState<WatchInterval[]>([]);
  const [currentInterval, setCurrentInterval] = useState<WatchInterval | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [lastValidTime, setLastValidTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [, setAutoResuming] = useState(false);
  const MINIMUM_WATCH_DURATION = 1;
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
  const userId = decoded?.userId;

  const debouncedSave = useCallback(
    debounce(async (intervals: WatchInterval[], currentTime: number, duration: number) => {
      try {
        if (!userId) return;
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/videos/progress/save`, {
          userId,
          videoId,
          watchedIntervals: intervals,
          lastPosition: currentTime,
          videoDuration: duration
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgress(response.data.totalProgress);

        // Only show toast if progress is not 100%
        if (Math.round(response.data.totalProgress) < 100) {
          toast.success('Progress saved');
        } else if (Math.round(response.data.totalProgress) === 100) {
          toast.success('Lecture completed!');
        }
      } catch (error) {
        // Only show error toast if progress is not 100%
        if (Math.round(progress) < 100) {
          toast.error('Failed to save progress');
          console.error('Failed to save progress:', error);
        }
      }
    }, 1000),
    [videoId, userId, token, progress]
  );

  useEffect(() => {
    return () => {
      if (currentInterval) {
        setWatchedIntervals(prev => [...prev, currentInterval]);
      }
      debouncedSave.flush();
    };
  }, [currentInterval]);

  useEffect(() => {
    const loadSavedProgress = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/videos/progress/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          setWatchedIntervals(response.data.watchedIntervals || []);
          setProgress(response.data.totalProgress || 0);
          if (response.data.lastPosition) {
            setResumeTime(response.data.lastPosition);
          }
        }
      } catch (error) {
        setLoadError('Failed to load progress. Click to retry.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProgress();
  }, [videoId, token]);

  const saveProgress = () => {
    if (!videoRef.current) return;
    debouncedSave(
      watchedIntervals,
      videoRef.current.currentTime, // Store actual seconds instead of minutes
      (videoRef.current.duration)
    );
  };

  const updateProgress = () => {
    if (!videoRef.current) return;
    const totalDuration = videoRef.current.duration;

    let allIntervals = [...watchedIntervals];
    if (currentInterval) {
      allIntervals.push(currentInterval);
    }

    const mergedIntervals = mergeIntervals(allIntervals);
    const totalWatched = mergedIntervals.reduce(
      (sum, interval) => sum + (interval.end - interval.start),
      0
    );

    let newProgress = (totalWatched / totalDuration) * 100;

    // If very close to 100 (like 99.8+), round to 100
    if (newProgress >= 99.8) newProgress = 100;
    setProgress(Math.min(newProgress, 100));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || seeking || !isPlaying) return;

    const currentTime = videoRef.current.currentTime;
    const timeDiff = Math.abs(currentTime - lastValidTime);

    if (timeDiff <= MINIMUM_WATCH_DURATION) {
      if (!currentInterval) {
        setCurrentInterval({ start: lastValidTime, end: currentTime });
      } else {
        setCurrentInterval(prev => prev ? { ...prev, end: currentTime } : null);
      }
      updateProgress();
    }
    setLastValidTime(currentTime);
  };

  const handleSeeking = () => {
    setSeeking(true);
    if (currentInterval && currentInterval.end - currentInterval.start >= MINIMUM_WATCH_DURATION) {
      setWatchedIntervals(prev => [...prev, currentInterval]);
    }
    setCurrentInterval(null);
  };

  const handleSeeked = () => {
    setSeeking(false);
    const currentTime = videoRef.current?.currentTime || 0;
    setLastValidTime(currentTime);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => {
    setIsPlaying(false);
    if (currentInterval) {
      setWatchedIntervals(prev => [...prev, currentInterval]);
      setCurrentInterval(null);
      saveProgress();
    }
  };

  const handleVideoLoad = () => {
    if (resumeTime && videoRef.current) {
      setAutoResuming(true);
      const resumeInSeconds = resumeTime > 10 ? resumeTime : resumeTime * 60;
      const formattedTime = formatTime(resumeInSeconds);
      
      toast.success(`Ready to resume from ${formattedTime}`, {
        duration: 3000,
      });

      videoRef.current.currentTime = resumeInSeconds;
      setLastValidTime(resumeInSeconds);
      setAutoResuming(false);
      setResumeTime(null);
    }
  };

  const mergeIntervals = (intervals: Array<{ start: number; end: number }>) => {
    if (intervals.length <= 1) return intervals;

    const sorted = [...intervals].sort((a, b) => a.start - b.start);
    const merged = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      if (current.start <= last.end) {
        last.end = Math.max(last.end, current.end);
      } else {
        merged.push(current);
      }
    }

    return merged;
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout failed:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Lecture Video</Typography>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              p: 4 
            }}>
              <Typography>Loading saved progress...</Typography>
            </Box>
          ) : loadError ? (
            <Box 
              sx={{ 
                p: 4, 
                backgroundColor: 'error.light',
                cursor: 'pointer',
                borderRadius: 1
              }}
              onClick={() => window.location.reload()}
            >
              <Typography color="error">{loadError}</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ 
                width: '100%', 
                position: 'relative',
                '& video': {
                  width: '100%',
                  borderRadius: 1,
                  mb: 2
                }
              }}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedData={handleVideoLoad}
                  onTimeUpdate={handleTimeUpdate}
                  onSeeking={handleSeeking}
                  onSeeked={handleSeeked}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  controls
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <ProgressBar
                  progress={Math.round(progress)}
                  resumeTime={resumeTime}
                  duration={videoRef.current?.duration || 0}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={Math.round(progress) < 100 || isPlaying}
                    sx={{ minWidth: 120 }}
                    onClick={() => {
                      toast.success('Completed! Moving to next lecture...');
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VideoPlayer;