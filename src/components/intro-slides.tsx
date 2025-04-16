"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlideDots } from "@/components/ui/slide-dots";
import { SlideContent } from "@/components/ui/slide-content";

export interface Slide {
  title: string;
  description: string;
  image?: string;
}

interface IntroSlidesProps {
  slides: Slide[];
  onComplete: () => void;
  onSkip?: () => void;
  logoSrc?: string;
  appName?: string;
  className?: string;
}

export function IntroSlides({
  slides,
  onComplete,
  onSkip,
  logoSrc = "/pilot-logo.svg",
  appName = "Pilot",
  className,
}: IntroSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-8 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Image 
              src={logoSrc} 
              alt={`${appName} Logo`} 
              width={40} 
              height={40}
              className="mr-3"
            />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{appName}</h2>
          </div>
          {onSkip && (
            <Button 
              onClick={onSkip} 
              variant="ghost"
            >
              Skip to Configure
            </Button>
          )}
        </div>
        
        <SlideContent
          title={slides[currentSlide].title}
          description={slides[currentSlide].description}
          image={slides[currentSlide].image}
          className="mb-8"
        />
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            variant="outline"
            className={currentSlide === 0 ? "cursor-not-allowed" : ""}
          >
            Previous
          </Button>
          
          <SlideDots 
            total={slides.length} 
            current={currentSlide} 
            onClick={goToSlide}
          />
          
          <Button 
            onClick={nextSlide}
            variant="default"
          >
            {currentSlide < slides.length - 1 ? 'Next' : 'Configure'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
