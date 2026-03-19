import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { testimonialAPI } from '../../services/api';
import { Testimonial } from '../../types';
import 'swiper/css';
import 'swiper/css/pagination';

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialAPI.getAll();
        setTestimonials(data);
        setError(null);
      } catch (err) {
        setError('Failed to load testimonials');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-24 bg-gray-50 py-16 rounded-2xl relative">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-8">
        Testimoni Alumni
      </h2>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{
          clickable: true,
          el: '.testimonial-pagination',
          bulletClass: 'w-2 h-2 mx-1 rounded-full bg-gray-300 inline-block cursor-pointer transition-all duration-300',
          bulletActiveClass: '!bg-blue-800 w-3'
        }}
        autoplay={{ delay: 5000 }}
        className="max-w-3xl mx-auto px-4 pb-8"
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide key={testimonial._id}>
            <div className="flex flex-col items-center text-center mb-4">
              {(() => {
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                const src =
                  testimonial.image && (testimonial.image.startsWith('http') || testimonial.image.startsWith('data:'))
                    ? testimonial.image
                    : testimonial.image
                      ? `${baseUrl}/uploads/${testimonial.image}`
                      : '';
                if (!src) {
                  return (
                    <div className="w-20 h-20 rounded-full bg-gray-200 mb-6" />
                  );
                }
                return (
                  <img
                    src={src}
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full object-cover mb-6"
                  />
                );
              })()}
              <blockquote className="text-xl text-gray-900 italic mb-6">
                "{testimonial.testimoni}"
              </blockquote>
              <div className="text-blue-800 font-semibold">{testimonial.name}</div>
              <div className="text-gray-600">
                {testimonial.pekerjaan} - {testimonial.perusahaan}
              </div>
              <div className="text-gray-500 text-sm">
                Alumni {testimonial.tahunlulus}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="testimonial-pagination text-center" />
    </div>
  );
}