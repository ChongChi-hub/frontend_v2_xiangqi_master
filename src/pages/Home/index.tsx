import React from 'react';
import { HeroSection } from '@/components/Home/HeroSection';
import { FeaturesSection } from '@/components/Home/FeaturesSection';
import { CommunitySection } from '@/components/Home/CommunitySection';
import { GallerySection } from '@/components/Home/GallerySection';
import { QuotesSection } from '@/components/Home/QuotesSection';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full flex flex-col xiangqi-master-bg min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CommunitySection />
      <GallerySection />
      <QuotesSection />
    </div>
  );
};

export default HomePage;
