import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

const navigation = [
  { name: "Beranda", href: "/" },
  { name: "Tentang Kami", href: "/tentang" },
  { name: "Guru", href: "/guru" },
  {
    name: "Digital",
    submenu: [
      { name: "E-Learning", href: "/digital/e-learning" },
      { name: "CBT Online", href: "/digital/cbt-online" },
    ],
  },
  {
    name: "Kegiatan",
    submenu: [
      { name: "Program Kegiatan", href: "/program" },
      { name: "Galery Kegiatan", href: "/kegiatan/galeri" },
      { name: "Kegiatan K3SP", href: "/kegiatan/k3sp" },
    ],
  },
  {
    name: "Dokumen",
    submenu: [
      { name: "Pengumuman", href: "/pengumuman" },
      { name: "Perangkat Ajar", href: "/perangkat-ajar" },
      { name: "Dokumen Surat", href: "/surat" },
    ],
  },
  { name: "Prestasi", href: "/prestasi" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const location = useLocation();
  const dropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as Node;
      Object.entries(dropdownRef.current).forEach(([key, ref]) => {
        if (ref && !ref.contains(clickedElement)) {
          setActiveDropdown((prev) => (prev === key ? "" : prev));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Treat <= 950px as "mobile" and ensure navbar is closed
      if (window.innerWidth <= 1000) {
        setIsOpen(false);
        setActiveDropdown("");
        setMobileDropdowns({});
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown("");
    setMobileDropdowns({});
  }, [location.pathname]);

  const handleDropdownClick = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? "" : itemName);
  };

  const handleMobileDropdownClick = (itemName: string) => {
    setMobileDropdowns((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const isProgramActive = (item: any) => {
    if (item.href) {
      return location.pathname === item.href;
    }
    return item.submenu?.some((sub: any) => sub.href === location.pathname);
  };

  return (
    <nav className="fixed w-full bg-white shadow-md z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 space-x-2">
        <img
          src="https://i.imgur.com/0qeWABT.png"
          alt="Logo PKG Kec. Barat"
          className="h-10 w-auto"
        />
        <Link
          to="/"
          className="flex flex-col leading-tight text-blue-900"
        >
          <span className="text-sm font-semibold tracking-[0.08em] uppercase">
            PUSAT KEGIATAN GURU
          </span>
          <span className="text-xs font-medium text-gray-700">
            Kecamatan Barat
          </span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden min-[1001px]:flex items-center space-x-6 ml-auto">
        {navigation.map((item) =>
          item.submenu ? (
            <div
              key={item.name}
              ref={(el) => (dropdownRef.current[item.name] = el)}
              className="relative"
            >
              <button
                onClick={() => handleDropdownClick(item.name)}
                className={`text-sm font-semibold flex items-center transition duration-300 ${
                  isProgramActive(item) || activeDropdown === item.name
                    ? "text-blue-800"
                    : "text-gray-900 hover:text-blue-800"
                }`}
              >
                {item.name}
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${
                    activeDropdown === item.name ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === item.name && (
                <div className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-10">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.href}
                      className={`block px-4 py-2 text-sm ${
                        location.pathname === sub.href
                          ? "text-blue-800 bg-blue-50 font-semibold"
                          : "text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold ${
                location.pathname === item.href
                  ? "text-blue-800"
                  : "text-gray-900 hover:text-blue-800"
              }`}
            >
              {item.name}
            </Link>
          )
        )}
        <Link
          to="/dashboard/login"
          className="px-4 py-2 rounded bg-blue-800 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </div>

      {/* Mobile menu button */}
      <div className="min-[1001px]:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 hover:text-blue-800"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </div>

    {/* Mobile Menu Items */}
    {isOpen && (
      <div className="min-100px]:hidden px-4 pt-2 pb-4 space-y-1 transition-all">
        {navigation.map((item) =>
          item.submenu ? (
            <div key={item.name}>
              <button
                onClick={() => handleMobileDropdownClick(item.name)}
                className="flex w-full justify-between items-center text-base font-medium text-gray-900"
              >
                {item.name}
                <ChevronDown
                  className={`transition-transform ${
                    mobileDropdowns[item.name] ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileDropdowns[item.name] && (
                <div className="pl-4 mt-1 space-y-1">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.href}
                      className="block text-sm text-gray-700 hover:text-blue-800"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.name}
              to={item.href}
              className="block text-base font-medium text-gray-900 hover:text-blue-800"
            >
              {item.name}
            </Link>
          )
        )}
        <Link
          to="/dashboard/login"
          className="block mt-3 px-4 py-2 rounded bg-blue-800 text-white text-center text-sm font-semibold hover:bg-blue-700"
          onClick={() => setIsOpen(false)}
        >
          Login
        </Link>
      </div>
    )}
  </div>
</nav>

  );
}
