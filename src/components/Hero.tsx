"use client"
import { useEffect, useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { usePublicCampusData } from "../contexts/PublicCampusDataContext"
import { settingsAPI } from "../services/api"
import DosenDetail from "./DosenDetail"
import type { Faculty } from "../types"

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  const { banners, faculty } = usePublicCampusData()
  const [activeIndex, setActiveIndex] = useState(0)
  const [hideMainHero, setHideMainHero] = useState(false)

  // Pencarian guru
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDosen, setSelectedDosen] = useState<Faculty | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Faculty[]>([])

  // Filter SATMINKAL (autocomplete)
  const [satInput, setSatInput] = useState("")
  const [selectedSatminkal, setSelectedSatminkal] = useState("")
  const [showSatDropdown, setShowSatDropdown] = useState(false)
  const satDropdownRef = useRef<HTMLDivElement | null>(null)

  const satOptions = Array.from(
    new Set(
      faculty
        .map((f) => f.satminkal?.trim())
        .filter((v): v is string => !!v)
    )
  ).sort()

  const filteredSatOptions = satOptions.filter((s) =>
    s.toLowerCase().includes(satInput.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (satDropdownRef.current && !satDropdownRef.current.contains(event.target as Node)) {
        setShowSatDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCariDosen = () => {
    setSearchError(null)
    const q = searchQuery.trim().toLowerCase()
    const sat = selectedSatminkal.trim()

    const matches = faculty.filter((f) => {
      const matchNameOrId =
        !q ||
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.nuptk && f.nuptk.toLowerCase().includes(q)) ||
        (f.nip && f.nip.toLowerCase().includes(q))

      const matchSat = !sat || (f.satminkal && f.satminkal === sat)

      return matchNameOrId && matchSat
    })

    if (matches.length === 0) {
      setSearchError("Data tidak ditemukan.")
      setSearchResults([])
      setSelectedDosen(null)
      return
    }
    setSearchError(null)
    setSearchResults(matches)
    if (matches.length === 1) {
      setSelectedDosen(matches[0])
    } else {
      setSelectedDosen(null)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await settingsAPI.getTheme()
        if (!mounted) return
        setHideMainHero(!!data.hideMainHero)
      } catch (error) {
        console.error("Failed to load hero visibility setting", error)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const bannerSlides =
    (banners || [])
      .filter((b) => b?.foto)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((b) => ({ kind: "banner" as const, banner: b }))

  const slides = hideMainHero
    ? bannerSlides
    : [{ kind: "main" as const }, ...bannerSlides]

  const activeSlide = slides[activeIndex]
  const isBannerWithHiddenText =
    activeSlide?.kind === "banner" && !!activeSlide.banner?.hideHeroText

  useEffect(() => {
    if (!mounted) return
    if (slides.length <= 1) return

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, slides.length])

  if (!mounted) return null

  return (
    <section className="relative isolate overflow-hidden bg-white min-h-[70vh] flex items-center">
      <AnimatePresence initial={false} mode="wait">
        {slides[activeIndex]?.kind === "banner" ? (
          <motion.div
            key={`banner-${slides[activeIndex].banner._id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={
                slides[activeIndex].banner.foto
                  ? (slides[activeIndex].banner.foto.startsWith("http") || slides[activeIndex].banner.foto.startsWith("data:")
                    ? slides[activeIndex].banner.foto
                    : `${(import.meta.env.VITE_API_URL || "http://localhost:3008").replace(/\/+$/, "")}/uploads/${slides[activeIndex].banner.foto}`)
                  : ""
              }
              alt={slides[activeIndex].banner.nama || "Banner"}
              className="h-full w-full object-cover"
              style={{
                objectPosition: slides[activeIndex].banner.imagePosition || 'center center',
                transform: `scale(${slides[activeIndex].banner.imageScale ?? 1})`,
                transformOrigin: slides[activeIndex].banner.imagePosition || 'center center',
              }}
            />
            <div className="absolute inset-0 bg-black/35" />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-12 left-0 md:left-1/4 w-80 h-48 md:w-[500px] md:h-[300px] bg-gradient-to-tr from-blue-400 via-blue-400 to-pink-300 opacity-40 sm:opacity-30 rotate-[-15deg] blur-[60px] md:blur-[100px] rounded-[50%]"></div>
              <div className="absolute top-1/4 right-1/4 w-52 h-52 md:w-96 md:h-96 bg-gradient-to-br from-blue-500 via-indigo-400 to-purple-300 opacity-35 sm:opacity-25 blur-[50px] md:blur-[80px] rotate-[15deg] rounded-[35%]"></div>
              <div className="absolute bottom-10 md:bottom-0 right-1/4 w-60 h-40 md:w-[400px] md:h-[200px] bg-gradient-to-r from-pink-300 via-purple-400 to-blue-400 opacity-35 sm:opacity-30 blur-[60px] md:blur-[120px] rotate-[10deg] rounded-[40%] hidden sm:block"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-20 md:py-24 w-full">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-center ${isBannerWithHiddenText ? "invisible" : ""}`}
          >
            <h1
              className={`py-5 text-4xl font-bold tracking-tight sm:text-6xl leading-tight mb-4 ${
                slides[activeIndex]?.kind === "banner" ? "text-white" : "text-gray-900"
              }`}
            >
              Selamat Datang di Website
            </h1>
            <p
              className={`text-xl sm:text-3xl font-bold mb-4 ${
                slides[activeIndex]?.kind === "banner" ? "text-white/95" : "text-blue-800"
              }`}
            >
              PKG (Pusat Kegiatan Guru) – Kecamatan Barat
            </p>
            <p
              className={`mt-4 text-lg leading-8 max-w-xl mx-auto ${
                slides[activeIndex]?.kind === "banner" ? "text-white/90" : "text-gray-600"
              }`}
            >
              Digitalisasi bukan sekadar perubahan teknologi, tetapi perubahan cara manusia berpikir, bekerja, dan berinteraksi. Perubahan digital mengajarkan kita bahwa inovasi adalah kebutuhan, bukan lagi pilihan.
            </p>
          </motion.div>

          {/* Cari Data Guru */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div
              className={`rounded-2xl p-4 md:p-5 shadow-xl flex flex-col sm:flex-row gap-3 items-stretch ${
                slides[activeIndex]?.kind === "banner"
                  ? "bg-white/95 backdrop-blur-md"
                  : "bg-white border border-gray-200"
              }`}
            >
              <input
                type="text"
                  placeholder="Nama / NUPTK/NIK Guru"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCariDosen()}
                className="flex-1 min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <div className="relative flex-1 min-w-0" ref={satDropdownRef}>
                <input
                  type="text"
                  placeholder="SATMINKAL"
                  value={satInput || selectedSatminkal}
                  onChange={(e) => {
                    setSatInput(e.target.value)
                    setSelectedSatminkal("")
                    setShowSatDropdown(true)
                  }}
                  onFocus={() => setShowSatDropdown(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleCariDosen()}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {showSatDropdown && filteredSatOptions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-48 overflow-auto">
                    {filteredSatOptions.map((sat) => (
                      <button
                        key={sat}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-blue-50 focus:bg-blue-50"
                        onClick={() => {
                          setSelectedSatminkal(sat)
                          setSatInput(sat)
                          setShowSatDropdown(false)
                        }}
                      >
                        {sat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCariDosen}
                className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-3 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Search className="h-5 w-5" />
                Cari
              </button>
            </div>
            {searchError && (
              <p className="mt-3 text-center text-red-600 font-medium bg-red-50 rounded-lg py-2 px-4">
                {searchError}
              </p>
            )}
            {searchResults.length > 1 && (
              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-gray-700">No</th>
                      <th className="px-4 py-2 font-semibold text-gray-700">Nama</th>
                      <th className="px-4 py-2 font-semibold text-gray-700">NUPTK/NIK</th>
                      <th className="px-4 py-2 font-semibold text-gray-700">SATMINKAL</th>
                      <th className="px-4 py-2 font-semibold text-gray-700 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {searchResults.map((guru, idx) => (
                      <tr key={guru._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-2 text-gray-900 font-medium">{guru.name}</td>
                        <td className="px-4 py-2 text-gray-700">{guru.nuptk || (guru as any).nik || "-"}</td>
                        <td className="px-4 py-2 text-gray-700">{guru.satminkal || "-"}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedDosen(guru)}
                            className="inline-flex items-center rounded-full border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <button 
              onClick={() => navigate('/program')}
              className="rounded-md bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
              Lihat Program Kami
            </button>
            <button
              onClick={() => navigate('/tentang')}
              className={`text-sm font-semibold leading-6 transition-colors flex items-center ${
                slides[activeIndex]?.kind === "banner"
                  ? "text-white hover:text-white/90"
                  : "text-gray-900 hover:text-blue-900"
              }`}
            >
              Pelajari Lebih Lanjut <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Modal Detail Dosen (hasil pencarian) */}
      {selectedDosen && (
        <DosenDetail
          dosen={selectedDosen}
          onClose={() => {
            setSelectedDosen(null)
            setSearchError(null)
          }}
        />
      )}
    </section>
  )
}