import React from 'react';
import { motion } from 'framer-motion';

interface SocialMediaProps {
  socialMedia: Array<{
    id: number;
    name: string;
    url: string;
    icon: string;
  }>;
}

const SocialMedia = ({ socialMedia }: SocialMediaProps) => {
  return (
    <div className="mt-24 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Ikuti Kami</h2>
      <div className="flex justify-center space-x-6">
        {socialMedia.map((social, index) => (
          <motion.a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-4xl hover:scale-110 transition-transform"
          >
            {social.icon}
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default SocialMedia;