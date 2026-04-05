import React, { useState, useEffect } from 'react';
import { featuredVideoAPI } from '../../services/api';
import type { FeaturedVideo } from '../../types';
import { getYouTubeVideoId } from '../../utils/youtube';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function HomeFeaturedVideos() {
  const [items, setItems] = useState<FeaturedVideo[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await featuredVideoAPI.getAll();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setReady(true);
      }
    };
    run();
  }, []);

  const resolved = items
    .map((v) => ({
      ...v,
      videoId: getYouTubeVideoId(v.youtubeUrl),
    }))
    .filter((v): v is FeaturedVideo & { videoId: string } => !!v.videoId);

  if (!ready || resolved.length === 0) {
    return null;
  }

  const embedParams = 'autoplay=1&mute=1&playsinline=1&rel=0';
  const embedSrc = (videoId: string) =>
    `https://www.youtube-nocookie.com/embed/${videoId}?${embedParams}`;

  return (
    <div className="mt-12 flex flex-col items-center max-w-6xl mx-auto px-6 pb-4 sm:pb-6">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-4 leading-tight">
        Video
      </h2>
      <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
        Tayangan video terpilih dari PKG Kecamatan Barat
      </p>

      <div className="w-full max-w-6xl">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: resolved.length > 1 ? 2 : 1 },
          }}
          className="pb-10"
        >
          {resolved.map((v) => (
            <SwiperSlide key={v._id}>
              <div className="px-1">
                <p className="text-center font-medium text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">{v.title}</p>
                <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-md aspect-video">
                  <iframe
                    title={v.title}
                    src={embedSrc(v.videoId)}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
