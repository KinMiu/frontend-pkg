import React, { createContext, useContext, useState, useEffect } from 'react';
import { Faculty, Achievement, Event, Pengumuman, Partner, Statistik, FeaturedVideo, Testimonial, Greeting, HKI, Patent, IndustrialDesign, RPS, Surat, Facility, Kurikulum, Banner, Program, Structural, PerangkatAjar } from '../types';
import { facultyAPI, achievementAPI, eventAPI, k3spEventAPI, pengumumanAPI, partnerAPI, statistikAPI, featuredVideoAPI, testimonialAPI, greetingAPI, hkiAPI, patentAPI, industrialDesignAPI, rpsAPI, suratAPI, perangkatAjarAPI, facilityAPI, kurikulumAPI, bannerAPI, programAPI, structuralAPI, operatorAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface CampusDataContextType {
  faculty: Faculty[];
  operators: any[];
  achievements: Achievement[];
  events: Event[];
  k3spEvents: Event[];
  pengumuman: Pengumuman[];
  statistics: Statistik[];
  partners: Partner[];
  featuredVideos: FeaturedVideo[];
  testimonials: Testimonial[];
  greetings: Greeting[];
  hki: HKI[];
  patents: Patent[];
  industrialDesigns: IndustrialDesign[];
  rps: RPS[];
  surat: Surat[];
  perangkatAjar: PerangkatAjar[];
  facilities: Facility[];
  kurikulums: Kurikulum[];
  banners: Banner[];
  programs: Program[];
  structurals: Structural[];
  loading: boolean;
  error: string | null;

  addFaculty: (data: any) => Promise<void>;
  updateFaculty: (id: string, data: any) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  getFacultyById: (id: string) => Promise<Faculty | undefined>;
  setFacultyResearchVisibilityAll: (isResearchPublic: boolean) => Promise<void>;

  addAchievement: (data: any) => Promise<void>;
  updateAchievement: (id: string, data: any) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  getAchievementById: (id: string) => Promise<Achievement | undefined>;

  addEvent: (data: any) => Promise<void>;
  updateEvent: (id: string, data: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Promise<Event | undefined>;

  addK3spEvent: (data: any) => Promise<void>;
  updateK3spEvent: (id: string, data: any) => Promise<void>;
  deleteK3spEvent: (id: string) => Promise<void>;
  getK3spEventById: (id: string) => Promise<Event | undefined>;

  addPengumuman: (data: any) => Promise<void>;
  updatePengumuman: (id: string, data: any) => Promise<void>;
  deletePengumuman: (id: string) => Promise<void>;
  getPengumumanById: (id: string) => Promise<Pengumuman | undefined>;

  addStatistik: (data: { name: string; value: string; order?: number }) => Promise<void>;
  updateStatistik: (id: string, data: { name?: string; value?: string; order?: number }) => Promise<void>;
  deleteStatistik: (id: string) => Promise<void>;
  getStatistikById: (id: string) => Promise<Statistik | undefined>;

  addPartner: (data: any) => Promise<void>;
  updatePartner: (id: string, data: any) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  getPartnerById: (id: string) => Promise<Partner | undefined>;

  addFeaturedVideo: (data: { title: string; youtubeUrl: string; order?: number }) => Promise<void>;
  updateFeaturedVideo: (id: string, data: { title?: string; youtubeUrl?: string; order?: number }) => Promise<void>;
  deleteFeaturedVideo: (id: string) => Promise<void>;

  addTestimonial: (data: any) => Promise<void>;
  updateTestimonial: (id: string, data: any) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  getTestimonialById: (id: string) => Promise<Testimonial | undefined>;

  addGreeting: (data: any) => Promise<void>;
  updateGreeting: (id: string, data: any) => Promise<void>;
  deleteGreeting: (id: string) => Promise<void>;
  getGreetingById: (id: string) => Promise<Greeting | undefined>;

  addHKI: (data: any) => Promise<void>;
  updateHKI: (id: string, data: any) => Promise<void>;
  deleteHKI: (id: string) => Promise<void>;
  getHKIById: (id: string) => Promise<HKI | undefined>;

  addPatent: (data: any) => Promise<void>;
  updatePatent: (id: string, data: any) => Promise<void>;
  deletePatent: (id: string) => Promise<void>;
  getPatentById: (id: string) => Promise<Patent | undefined>;

  addIndustrialDesign: (data: any) => Promise<void>;
  updateIndustrialDesign: (id: string, data: any) => Promise<void>;
  deleteIndustrialDesign: (id: string) => Promise<void>;
  getIndustrialDesignById: (id: string) => Promise<IndustrialDesign | undefined>;

  addRPS: (data: any) => Promise<void>;
  updateRPS: (id: string, data: any) => Promise<void>;
  deleteRPS: (id: string) => Promise<void>;
  getRPSById: (id: string) => Promise<RPS | undefined>;

  addSurat: (data: any) => Promise<void>;
  updateSurat: (id: string, data: any) => Promise<void>;
  deleteSurat: (id: string) => Promise<void>;
  getSuratById: (id: string) => Promise<Surat | undefined>;

  addPerangkatAjar: (data: any) => Promise<void>;
  updatePerangkatAjar: (id: string, data: any) => Promise<void>;
  deletePerangkatAjar: (id: string) => Promise<void>;
  getPerangkatAjarById: (id: string) => Promise<PerangkatAjar | undefined>;

  addFacility: (data: any) => Promise<void>;
  updateFacility: (id: string, data: any) => Promise<void>;
  deleteFacility: (id: string) => Promise<void>;
  getFacilityById: (id: string) => Promise<Facility | undefined>;

  addKurikulum: (data: any) => Promise<void>;
  updateKurikulum: (id: string, data: any) => Promise<void>;
  deleteKurikulum: (id: string) => Promise<void>;
  getKurikulumById: (id: string) => Promise<Kurikulum | undefined>;

  addBanner: (data: any) => Promise<void>;
  updateBanner: (id: string, data: any) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  getBannerById: (id: string) => Promise<Banner | undefined>;

  addProgram: (data: any) => Promise<void>;
  updateProgram: (id: string, data: any) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  getProgramById: (id: string) => Promise<Program | undefined>;

  addStructural: (data: any) => Promise<void>;
  updateStructural: (id: string, data: any) => Promise<void>;
  deleteStructural: (id: string) => Promise<void>;
  getStructuralById: (id: string) => Promise<Structural | undefined>;

  // Operator handlers (SATMINKAL master)
  addOperator: (data: any) => Promise<void>;
  updateOperator: (id: string, data: any) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;
  getOperatorById: (id: string) => Promise<any | undefined>;

  refreshData: () => Promise<void>;

  // Global UI flags
  hideEmployeeDocsPublic: boolean;
  setHideEmployeeDocsPublic: (value: boolean) => Promise<void>;
}

const CampusDataContext = createContext<CampusDataContextType | undefined>(undefined);

export const useCampusData = () => {
  const context = useContext(CampusDataContext);
  if (!context) {
    throw new Error('useCampusData must be used within a CampusDataProvider');
  }
  return context;
};

export const CampusDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [k3spEvents, setK3spEvents] = useState<Event[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [statistics, setStatistics] = useState<Statistik[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [hki, setHKI] = useState<HKI[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [industrialDesigns, setIndustrialDesigns] = useState<IndustrialDesign[]>([]);
  const [rps, setRps] = useState<RPS[]>([]);
  const [surat, setSurat] = useState<Surat[]>([]);
  const [perangkatAjar, setPerangkatAjar] = useState<PerangkatAjar[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [structurals, setStructurals] = useState<Structural[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hideEmployeeDocsPublic, setHideEmployeeDocsPublicState] = useState<boolean>(false);

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
        partnersData,
        featuredVideosData,
        testimonialsData,
        greetingsData,
        hkiData,
        patentsData,
        industrialDesignsData,
        rpsData,
        suratData,
        perangkatAjarData,
        facilitiesData,
        kurikulumsData,
        bannersData,
        programsData,
        structuralsData,
        operatorsData,
      ] = await Promise.all([
        facultyAPI.getAll(),
        achievementAPI.getAll(),
        eventAPI.getAll(),
        k3spEventAPI.getAll(),
        pengumumanAPI.getAll(),
        statistikAPI.getAll(),
        partnerAPI.getAll(),
        featuredVideoAPI.getAll(),
        testimonialAPI.getAll(),
        greetingAPI.getAll(),
        hkiAPI.getAll(),
        patentAPI.getAll(),
        industrialDesignAPI.getAll(),
        rpsAPI.getAll(),
        suratAPI.getAll(),
        perangkatAjarAPI.getAll(),
        facilityAPI.getAll(),
        kurikulumAPI.getAll(),
        bannerAPI.getAll(),
        programAPI.getAll(),
        structuralAPI.getAll(),
        operatorAPI.getAll(),
      ]);
      setFaculty(facultyData);
      setAchievements(achievementsData);
      setEvents(eventsData);
      setK3spEvents(k3spEventsData);
      setPengumuman(pengumumanData);
      setStatistics(statisticsData);
      setPartners(partnersData);
      setFeaturedVideos(featuredVideosData);
      setTestimonials(testimonialsData);
      setGreetings(greetingsData);
      setHKI(hkiData);
      setPatents(patentsData);
      setIndustrialDesigns(industrialDesignsData);
      setRps(rpsData);
      setSurat(suratData);
      setPerangkatAjar(perangkatAjarData);
      setFacilities(facilitiesData);
      setKurikulums(kurikulumsData);
      setBanners(bannersData);
      setPrograms(programsData);
      setStructurals(structuralsData);
      setOperators(operatorsData);

      // Derive global "hide employee docs" flag from faculty isResearchPublic
      if (Array.isArray(facultyData) && facultyData.length > 0) {
        const first = facultyData[0] as any;
        const isResearchPublic = first && typeof first.isResearchPublic === 'boolean'
          ? first.isResearchPublic
          : true;
        setHideEmployeeDocsPublicState(!isResearchPublic);
      }
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

  // ---- Faculty Handlers ----
  const addFaculty = async (data: any) => {
    try {
      await facultyAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add faculty');
      throw err;
    }
  };

  const updateFaculty = async (id: string, data: any) => {
    try {
      await facultyAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update faculty');
      throw err;
    }
  };

  const deleteFaculty = async (id: string) => {
    try {
      await facultyAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete faculty');
      throw err;
    }
  };

  const setFacultyResearchVisibilityAll = async (isResearchPublic: boolean) => {
    try {
      await facultyAPI.setResearchVisibilityAll(isResearchPublic);
      // Optimistically update local faculty state without triggering global loading
      setFaculty(prev =>
        prev.map(f => ({ ...(f as any), isResearchPublic }) as Faculty)
      );
    } catch (err) {
      toast.error('Failed to update research visibility');
      throw err;
    }
  };

  const setHideEmployeeDocsPublic = async (value: boolean) => {
    // Optimistic UI update: immediately reflect switch state
    setHideEmployeeDocsPublicState(value);
    const targetIsResearchPublic = !value;
    try {
      await setFacultyResearchVisibilityAll(targetIsResearchPublic);
    } catch {
      // Roll back on error
      setHideEmployeeDocsPublicState(prev => !prev);
    }
  };

  const getFacultyById = async (id: string): Promise<Faculty | undefined> => {
    try {
      return await facultyAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get faculty details');
      throw err;
    }
  };

  // ---- Achievement Handlers ----
  const addAchievement = async (data: any) => {
    try {
      await achievementAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add achievement');
      throw err;
    }
  };

  const updateAchievement = async (id: string, data: any) => {
    try {
      await achievementAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update achievement');
      throw err;
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      await achievementAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete achievement');
      throw err;
    }
  };

  const getAchievementById = async (id: string): Promise<Achievement | undefined> => {
    try {
      return await achievementAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get achievement details');
      throw err;
    }
  };

  // ---- Event Handlers ----
  const addEvent = async (data: any) => {
    try {
      await eventAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add event');
      throw err;
    }
  };

  const updateEvent = async (id: string, data: any) => {
    try {
      await eventAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete event');
      throw err;
    }
  };

  const getEventById = async (id: string): Promise<Event | undefined> => {
    try {
      return await eventAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get event details');
      throw err;
    }
  };

  // ---- K3SP Event Handlers ----
  const addK3spEvent = async (data: any) => {
    try {
      await k3spEventAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add event');
      throw err;
    }
  };

  const updateK3spEvent = async (id: string, data: any) => {
    try {
      await k3spEventAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update event');
      throw err;
    }
  };

  const deleteK3spEvent = async (id: string) => {
    try {
      await k3spEventAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete event');
      throw err;
    }
  };

  const getK3spEventById = async (id: string): Promise<Event | undefined> => {
    try {
      return await k3spEventAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get event details');
      throw err;
    }
  };

  // ---- Pengumuman Handlers ----
  const addPengumuman = async (data: any) => {
    try {
      await pengumumanAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add pengumuman');
      throw err;
    }
  };

  const updatePengumuman = async (id: string, data: any) => {
    try {
      await pengumumanAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update pengumuman');
      throw err;
    }
  };

  const deletePengumuman = async (id: string) => {
    try {
      await pengumumanAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete pengumuman');
      throw err;
    }
  };

  const getPengumumanById = async (id: string): Promise<Pengumuman | undefined> => {
    try {
      return await pengumumanAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get pengumuman details');
      throw err;
    }
  };

  // ---- Statistik Handlers ----
  const addStatistik = async (data: { name: string; value: string; order?: number }) => {
    try {
      await statistikAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Gagal menambah statistik');
      throw err;
    }
  };

  const updateStatistik = async (id: string, data: { name?: string; value?: string; order?: number }) => {
    try {
      await statistikAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Gagal memperbarui statistik');
      throw err;
    }
  };

  const deleteStatistik = async (id: string) => {
    try {
      await statistikAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Gagal menghapus statistik');
      throw err;
    }
  };

  const getStatistikById = async (id: string): Promise<Statistik | undefined> => {
    try {
      return await statistikAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get statistik details');
      throw err;
    }
  };

  // ---- Partner Handlers ----
  const addPartner = async (data: any) => {
    try {
      await partnerAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add partner');
      throw err;
    }
  };

  const updatePartner = async (id: string, data: any) => {
    try {
      await partnerAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update partner');
      throw err;
    }
  };

  const deletePartner = async (id: string) => {
    try {
      await partnerAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete partner');
      throw err;
    }
  };

  const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    try {
      return await partnerAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get partner details');
      throw err;
    }
  };

  const addFeaturedVideo = async (data: { title: string; youtubeUrl: string; order?: number }) => {
    try {
      await featuredVideoAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Gagal menambah video');
      throw err;
    }
  };

  const updateFeaturedVideo = async (
    id: string,
    data: { title?: string; youtubeUrl?: string; order?: number }
  ) => {
    try {
      await featuredVideoAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Gagal memperbarui video');
      throw err;
    }
  };

  const deleteFeaturedVideo = async (id: string) => {
    try {
      await featuredVideoAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Gagal menghapus video');
      throw err;
    }
  };

  // ---- Testimonial Handlers ----
  const addTestimonial = async (data: any) => {
    try {
      await testimonialAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add testimonial');
      throw err;
    }
  };

  const updateTestimonial = async (id: string, data: any) => {
    try {
      await testimonialAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update testimonial');
      throw err;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await testimonialAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete testimonial');
      throw err;
    }
  };

  const getTestimonialById = async (id: string): Promise<Testimonial | undefined> => {
    try {
      return await testimonialAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get testimonial details');
      throw err;
    }
  };

  // ---- Greeting Handlers ----
  const addGreeting = async (data: any) => {
    try {
      await greetingAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add greeting');
      throw err;
    }
  };

  const updateGreeting = async (id: string, data: any) => {
    try {
      await greetingAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update greeting');
      throw err;
    }
  };

  const deleteGreeting = async (id: string) => {
    try {
      await greetingAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete greeting');
      throw err;
    }
  };

  const getGreetingById = async (id: string): Promise<Greeting | undefined> => {
    try {
      return await greetingAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get greeting details');
      throw err;
    }
  };

  // ---- HKI Handlers ----
  const addHKI = async (data: any) => {
    try {
      await hkiAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add HKI');
      throw err;
    }
  };

  const updateHKI = async (id: string, data: any) => {
    try {
      await hkiAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update HKI');
      throw err;
    }
  };

  const deleteHKI = async (id: string) => {
    try {
      await hkiAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete HKI');
      throw err;
    }
  };

  const getHKIById = async (id: string): Promise<HKI | undefined> => {
    try {
      return await hkiAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get HKI details');
      throw err;
    }
  };

  // ---- Patent Handlers ----
  const addPatent = async (data: any) => {
    try {
      await patentAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add patent');
      throw err;
    }
  };

  const updatePatent = async (id: string, data: any) => {
    try {
      await patentAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update patent');
      throw err;
    }
  };

  const deletePatent = async (id: string) => {
    try {
      await patentAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete patent');
      throw err;
    }
  };

  const getPatentById = async (id: string): Promise<Patent | undefined> => {
    try {
      return await patentAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get patent details');
      throw err;
    }
  };

  // ---- Industrial Design Handlers ----
  const addIndustrialDesign = async (data: any) => {
    try {
      await industrialDesignAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add industrial design');
      throw err;
    }
  };

  const updateIndustrialDesign = async (id: string, data: any) => {
    try {
      await industrialDesignAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update industrial design');
      throw err;
    }
  };

  const deleteIndustrialDesign = async (id: string) => {
    try {
      await industrialDesignAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete industrial design');
      throw err;
    }
  };

  const getIndustrialDesignById = async (id: string): Promise<IndustrialDesign | undefined> => {
    try {
      return await industrialDesignAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get industrial design details');
      throw err;
    }
  };

  // ---- RPS Handlers ----
  const addRPS = async (data: any) => {
    try {
      await rpsAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add RPS');
      throw err;
    }
  };

  const updateRPS = async (id: string, data: any) => {
    try {
      await rpsAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update RPS');
      throw err;
    }
  };

  const deleteRPS = async (id: string) => {
    try {
      await rpsAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete RPS');
      throw err;
    }
  };

  const getRPSById = async (id: string): Promise<RPS | undefined> => {
    try {
      return await rpsAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get RPS details');
      throw err;
    }
  };

  // ---- Surat Handlers ----
  const addSurat = async (data: any) => {
    try {
      await suratAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add Surat');
      throw err;
    }
  };

  const updateSurat = async (id: string, data: any) => {
    try {
      await suratAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update Surat');
      throw err;
    }
  };

  const deleteSurat = async (id: string) => {
    try {
      await suratAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete Surat');
      throw err;
    }
  };

  const getSuratById = async (id: string): Promise<Surat | undefined> => {
    try {
      return await suratAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get Surat details');
      throw err;
    }
  };

  // ---- Perangkat Ajar Handlers ----
  const addPerangkatAjar = async (data: any) => {
    try {
      await perangkatAjarAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add Perangkat Ajar');
      throw err;
    }
  };

  const updatePerangkatAjar = async (id: string, data: any) => {
    try {
      await perangkatAjarAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update Perangkat Ajar');
      throw err;
    }
  };

  const deletePerangkatAjar = async (id: string) => {
    try {
      await perangkatAjarAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete Perangkat Ajar');
      throw err;
    }
  };

  const getPerangkatAjarById = async (id: string): Promise<PerangkatAjar | undefined> => {
    try {
      return await perangkatAjarAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get Perangkat Ajar details');
      throw err;
    }
  };

  // ---- Facility Handlers ----
  const addFacility = async (data: any) => {
    try {
      await facilityAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add facility');
      throw err;
    }
  };

  const updateFacility = async (id: string, data: any) => {
    try {
      await facilityAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update facility');
      throw err;
    }
  };

  const deleteFacility = async (id: string) => {
    try {
      await facilityAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete facility');
      throw err;
    }
  };

  const getFacilityById = async (id: string): Promise<Facility | undefined> => {
    try {
      return await facilityAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get facility details');
      throw err;
    }
  };

  // ---- Kurikulum Handlers ----
  const addKurikulum = async (data: any) => {
    try {
      await kurikulumAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add kurikulum');
      throw err;
    }
  };

  const updateKurikulum = async (id: string, data: any) => {
    try {
      await kurikulumAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update kurikulum');
      throw err;
    }
  };

  const deleteKurikulum = async (id: string) => {
    try {
      await kurikulumAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete kurikulum');
      throw err;
    }
  };

  const getKurikulumById = async (id: string): Promise<Kurikulum | undefined> => {
    try {
      return await kurikulumAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get kurikulum details');
      throw err;
    }
  };

  // ---- Banner Handlers ----
  const addBanner = async (data: any) => {
    try {
      await bannerAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add banner');
      throw err;
    }
  };

  const updateBanner = async (id: string, data: any) => {
    try {
      await bannerAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update banner');
      throw err;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await bannerAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete banner');
      throw err;
    }
  };

  const getBannerById = async (id: string): Promise<Banner | undefined> => {
    try {
      return await bannerAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get banner details');
      throw err;
    }
  };

  // ---- Program Pembelajaran Handlers ----
  const addProgram = async (data: any) => {
    try {
      await programAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add program');
      throw err;
    }
  };

  const updateProgram = async (id: string, data: any) => {
    try {
      await programAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update program');
      throw err;
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      await programAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete program');
      throw err;
    }
  };

  const getProgramById = async (id: string): Promise<Program | undefined> => {
    try {
      return await programAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get program details');
      throw err;
    }
  };

  // ---- Structural Handlers ----
  const addStructural = async (data: any) => {
    try {
      await structuralAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add structural data');
      throw err;
    }
  };

  const updateStructural = async (id: string, data: any) => {
    try {
      await structuralAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update structural data');
      throw err;
    }
  };

  const deleteStructural = async (id: string) => {
    try {
      await structuralAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete structural data');
      throw err;
    }
  };

  const getStructuralById = async (id: string): Promise<Structural | undefined> => {
    try {
      return await structuralAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get structural details');
      throw err;
    }
  };

  // ---- Operator Handlers (SATMINKAL master) ----
  const addOperator = async (data: any) => {
    try {
      await operatorAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to add operator');
      throw err;
    }
  };

  const updateOperator = async (id: string, data: any) => {
    try {
      await operatorAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update operator');
      throw err;
    }
  };

  const deleteOperator = async (id: string) => {
    try {
      await operatorAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete operator');
      throw err;
    }
  };

  const getOperatorById = async (id: string): Promise<any | undefined> => {
    try {
      return await operatorAPI.getById(id);
    } catch (err) {
      toast.error('Failed to get operator details');
      throw err;
    }
  };

  const value: CampusDataContextType = {
    faculty,
    operators,
    achievements,
    events,
    k3spEvents,
    pengumuman,
    statistics,
    partners,
    featuredVideos,
    testimonials,
    greetings,
    hki,
    patents,
    industrialDesigns,
    rps,
    surat,
    perangkatAjar,
    facilities,
    kurikulums,
    banners,
    programs,
    structurals,
    loading,
    error,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    getFacultyById,
    setFacultyResearchVisibilityAll,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    getAchievementById,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,

    addK3spEvent,
    updateK3spEvent,
    deleteK3spEvent,
    getK3spEventById,

    addPengumuman,
    updatePengumuman,
    deletePengumuman,
    getPengumumanById,
    addStatistik,
    updateStatistik,
    deleteStatistik,
    getStatistikById,
    addPartner,
    updatePartner,
    deletePartner,
    getPartnerById,
    addFeaturedVideo,
    updateFeaturedVideo,
    deleteFeaturedVideo,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getTestimonialById,
    addGreeting,
    updateGreeting,
    deleteGreeting,
    getGreetingById,
    addHKI,
    updateHKI,
    deleteHKI,
    getHKIById,
    addPatent,
    updatePatent,
    deletePatent,
    getPatentById,
    addIndustrialDesign,
    updateIndustrialDesign,
    deleteIndustrialDesign,
    getIndustrialDesignById,
    addRPS,
    updateRPS,
    deleteRPS,
    getRPSById,
    addSurat,
    updateSurat,
    deleteSurat,
    getSuratById,

    addPerangkatAjar,
    updatePerangkatAjar,
    deletePerangkatAjar,
    getPerangkatAjarById,
    addFacility,
    updateFacility,
    deleteFacility,
    getFacilityById,
    addKurikulum,
    updateKurikulum,
    deleteKurikulum,
    getKurikulumById,
    addBanner,
    updateBanner,
    deleteBanner,
    getBannerById,
    addProgram,
    updateProgram,
    deleteProgram,
    getProgramById,
    addStructural,
    updateStructural,
    deleteStructural,
    getStructuralById,
    addOperator,
    updateOperator,
    deleteOperator,
    getOperatorById,
    refreshData: fetchData,

    hideEmployeeDocsPublic,
    setHideEmployeeDocsPublic,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <CampusDataContext.Provider value={value}>
      {children}
    </CampusDataContext.Provider>
  );
};