"use client"

import { BackgroundCircles } from "./background-circles"

export const HeroSection = () => {
  return (
    <BackgroundCircles 
      title={
        <>
          AI-Powered <br /> Business Solutions
        </>
      }
      description="Transform business with intelligent WhatsApp integration, automated booking systems, and AI-driven customer interactions that work 24/7."
      variant="primary"
    />
  )
}