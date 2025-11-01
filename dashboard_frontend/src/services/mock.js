import { addDays, formatISO } from 'date-fns';
import { randomId } from '../utils/random';

const demoUser = { id: 'u_1', name: 'Dr. Jane Doe', email: 'jane@example.com' };

const demoSummary = {
  totalVideos: 128,
  processed: 117,
  pending: 11,
  detectedBehaviors: 462,
  latestActivity: [
    { id: randomId(), animal: 'Elephant', behavior: 'Foraging', time: formatISO(new Date()), status: 'Processed' },
    { id: randomId(), animal: 'Lion', behavior: 'Hunting', time: formatISO(addDays(new Date(), -1)), status: 'Processing' },
    { id: randomId(), animal: 'Zebra', behavior: 'Grazing', time: formatISO(addDays(new Date(), -2)), status: 'Processed' },
  ]
};

const demoVideos = Array.from({ length: 8 }).map((_, idx) => ({
  id: `vid_${idx + 1}`,
  name: `wildlife_${idx + 1}.mp4`,
  animal: ['Elephant', 'Lion', 'Zebra', 'Giraffe'][idx % 4],
  uploadedAt: formatISO(addDays(new Date(), -(idx + 1))),
  status: ['Processed', 'Processing', 'Queued'][idx % 3],
  duration: `${3 + idx}:${(idx * 7) % 60}`.padStart(2, '0'),
}));

const demoAnalytics = Array.from({ length: 6 }).map((_, idx) => ({
  id: `rep_${idx + 1}`,
  title: `Behavior Report #${idx + 1}`,
  createdAt: formatISO(addDays(new Date(), -(idx * 3))),
  animal: ['Elephant', 'Lion', 'Zebra', 'Giraffe'][idx % 4],
  behaviors: ['Foraging', 'Hunting', 'Grazing', 'Resting'].slice(0, (idx % 4) + 1),
  downloads: Math.round(Math.random() * 50),
}));

// PUBLIC_INTERFACE
export const mockApi = {
  auth: {
    async login() {
      return new Promise(resolve => setTimeout(() => resolve({
        token: 'mock-token',
        user: demoUser
      }), 400));
    },
    async register({ name, email }) {
      return new Promise(resolve => setTimeout(() => resolve({
        token: 'mock-token',
        user: { id: 'u_2', name: name || 'New User', email }
      }), 500));
    }
  },
  dashboard: {
    async summary() {
      return new Promise(resolve => setTimeout(() => resolve(demoSummary), 300));
    }
  },
  videos: {
    async list() {
      return new Promise(resolve => setTimeout(() => resolve(demoVideos), 300));
    },
    async upload(file) {
      const item = {
        id: randomId(),
        name: file?.name || 'new_video.mp4',
        animal: 'Unknown',
        uploadedAt: formatISO(new Date()),
        status: 'Queued',
        duration: '0:00'
      };
      demoVideos.unshift(item);
      return new Promise(resolve => setTimeout(() => resolve(item), 400));
    }
  },
  analytics: {
    async list() {
      return new Promise(resolve => setTimeout(() => resolve(demoAnalytics), 300));
    }
  }
};
