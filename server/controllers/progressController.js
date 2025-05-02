const Progress = require('../models/Progress');

const saveProgress = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { videoId, watchedIntervals, lastPosition, videoDuration } = req.body;
    const userId = req.user._id;

    const totalProgress = calculateProgress(watchedIntervals, videoDuration);

    const formattedLastPosition = parseFloat((lastPosition / 60).toFixed(2));

    await Progress.findOneAndUpdate(
      { userId, videoId },
      {
        watchedIntervals,
        totalProgress,
        lastPosition,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    res.status(200).json({ success: true, totalProgress });
  } catch (error) {
    console.error('Save Progress Error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
};

const getProgress = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { videoId } = req.params;
    const userId = req.user._id;

    console.log('Get Progress - User ID:', userId);
    console.log('Get Progress - Video ID:', videoId);

    const progress = await Progress.findOne({ userId, videoId });
    if (!progress) {
      return res.json({ watchedIntervals: [], totalProgress: 0, lastPosition: 0 });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get Progress Error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

const calculateProgress = (intervals, duration) => {
  const merged = mergeIntervals(intervals);
  const totalWatched = merged.reduce((sum, interval) => 
    sum + (interval.end - interval.start), 0);
  const rawProgress = (totalWatched / duration) * 100;
  return Math.round(Number(rawProgress.toFixed(2)), 100);
};

const mergeIntervals = (intervals) => {
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

module.exports = {
  saveProgress,
  getProgress
};
