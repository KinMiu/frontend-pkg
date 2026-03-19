import React, { createContext, useContext, useState, useEffect } from 'react';
import { Faculty, Achievement, Event, Pengumuman, Statistik, Banner, Surat, PerangkatAjar } from '../types';
import { facultyAPI, achievementAPI, eventAPI, k3spEventAPI, pengumumanAPI, statistikAPI, bannerAPI, suratAPI, perangkatAjarAPI } from '../services/api';

interface PublicCampusDataContextType {
  faculty: Faculty[];
  achievements: Achievement[];
  events: Event[];
  k3spEvents: Event[];
  pengumuman: Pengumuman[];
  statistics: Statistik[];
  banners: Banner[];
  surat: Surat[];
  perangkatAjar: PerangkatAjar[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const PublicCampusDataContext = createContext<PublicCampusDataContextType | undefined>(undefined);

export const usePublicCampusData = () => {
  const context = useContext(PublicCampusDataContext);
  if (!context) {
    throw new Error('usePublicCampusData must be used within a PublicCampusDataProvider');
  }
  return context;
};

export const PublicCampusDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [k3spEvents, setK3spEvents] = useState<Event[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [statistics, setStatistics] = useState<Statistik[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [surat, setSurat] = useState<Surat[]>([]);
  const [perangkatAjar, setPerangkatAjar] = useState<PerangkatAjar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        facultyData,
        achievementsData,
        eventsData,
        k3spEventsData,
        pengumumanData,
        statisticsData,
        bannerData,
        suratData,
        perangkatAjarData,
      ] = await Promise.all([
        facultyAPI.getAll(),
        achievementAPI.getAll(),
        eventAPI.getAll(),
        k3spEventAPI.getAll(),
        pengumumanAPI.getAll(),
        statistikAPI.getAll(),
        bannerAPI.getAll(),
        suratAPI.getAll(),
        perangkatAjarAPI.getAll(),
      ]);
      setFaculty(facultyData);
      setAchievements(achievementsData);
      setEvents(eventsData);
      setK3spEvents(k3spEventsData);
      setPengumuman(pengumumanData);
      setStatistics(statisticsData);
      setBanners(bannerData);
      setSurat(suratData);
      setPerangkatAjar(perangkatAjarData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value: PublicCampusDataContextType = {
    faculty,
    achievements,
    events,
    k3spEvents,
    pengumuman,
    statistics,
    banners,
    surat,
    perangkatAjar,
    loading,
    error,
    refreshData: fetchData,
  };

  return (
    <PublicCampusDataContext.Provider value={value}>
      {children}
    </PublicCampusDataContext.Provider>
  );
};
