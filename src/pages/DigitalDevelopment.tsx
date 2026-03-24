import React from 'react';

type DigitalDevelopmentProps = {
  title: string;
};

const DigitalDevelopment = ({ title }: DigitalDevelopmentProps) => {
  window.scrollTo(0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-10 text-center">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            {title}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600">
            Menu ini sedang dalam tahap pengembangan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalDevelopment;
