import React, { useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';

const Content = ({ activeData, setCondition, condition }) => {
  const [animationCompleted, setAnimationCompleted] = useState(false);

  const handleAnimation = useCallback(() => {
    if (condition || animationCompleted) return;

    setCondition(true);

    gsap.to('.button', {
      color: activeData.buttonColor.text,
      backgroundColor: activeData.buttonColor.background,
      ease: 'power3.inOut',
      duration: 1,
    });

    gsap.to('p', {
      color: activeData.headingColor,
      ease: 'power3.inOut',
      duration: 0.8,
    });

    gsap.from('.text', {
      y: 200,
      ease: 'power4.out',
      duration: 1,
      stagger: {
        amount: 0.3,
      },
      onComplete: () => {
        setCondition(false);
        setAnimationCompleted(true);
      },
    });
  }, [activeData, condition, setCondition, animationCompleted]);

  useEffect(() => {
    handleAnimation();
  }, [handleAnimation]);

  return (
    <div className="select-none w-full h-2/5 flex justify-center items-center lg:w-1/2 lg:h-full lg:justify-end">
      <div className="flex justify-start flex-col items-start w-3/4"> {/* Adjusted width */}
        <h1 className="text-left text-4xl font-bold mb-1 w-full relative p-1 overflow-hidden md:text-[6vw] md:mb-2">
          <p className="text-xl">{activeData.heading}</p>
        </h1>
        <h6 className="text-left text-lg font-regular mb-6 w-full p-1 overflow-hidden md:text-xl">
          <p className="text-md">{activeData.subHeading}</p>
        </h6>
        <p className="w-full text-sm font-medium text-left mb-8 p-1 overflow-hidden md:text-base md:mb-12">
          <p className="text-xs">{activeData.text}</p>
        </p>
        <div className="relative overflow-hidden p-4">
        
        </div>
      </div>
    </div>
  );
};

export default Content;
