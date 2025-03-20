import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Volume2, Volume2Off, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface TalkingChickenProps {
  showOnMount?: boolean;
  autoOpen?: boolean;
  message?: string;
  step?: number;
  onComplete?: () => void;
  onSkip?: () => void;
  showControls?: boolean;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    message: "Welcome to ChickFarms! I'm your guide, Clucky! 🐔 I'll help you learn the basics of farming and earning.",
    emotion: "happy",
  },
  {
    step: 2,
    message: "Start by buying a chicken from the Shop tab. Chickens will lay eggs that you can sell for profits!",
    emotion: "excited",
  },
  {
    step: 3,
    message: "Remember to feed your chickens with wheat and give them water to keep them productive!",
    emotion: "normal",
  },
  {
    step: 4, 
    message: "Don't forget to collect your daily rewards and invite friends with your referral link!",
    emotion: "happy",
  },
  {
    step: 5,
    message: "That's the basics! You can always find me if you need help. Happy farming!",
    emotion: "excited",
  }
];

export function TalkingChicken({
  showOnMount = true,
  autoOpen = true,
  message,
  step,
  onComplete,
  onSkip,
  showControls = true,
}: TalkingChickenProps) {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [currentStep, setCurrentStep] = useState(step || 1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get tutorial status from the server
  const { data: tutorialStatus } = useQuery({
    queryKey: ['/api/tutorial/status'],
    queryFn: async () => {
      if (!user) return null;
      const data = await apiRequest<{
        tutorialStep: number;
        tutorialCompleted: boolean;
        tutorialDisabled: boolean;
      }>({ 
        url: '/api/tutorial/status',
        method: 'GET',
      });
      return data;
    },
    enabled: !!user,
  });

  // Update tutorial step mutation
  const updateStepMutation = useMutation({
    mutationFn: async (step: number) => {
      return apiRequest({
        url: '/api/tutorial/update-step',
        method: 'POST',
        body: { step },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorial/status'] });
    },
  });

  // Complete tutorial mutation
  const completeTutorialMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        url: '/api/tutorial/complete',
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorial/status'] });
      if (onComplete) onComplete();
    },
  });

  // Disable tutorial mutation
  const disableTutorialMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        url: '/api/tutorial/disable',
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorial/status'] });
      setIsVisible(false);
      if (onSkip) onSkip();
    },
  });

  // Initialize with data from server if available
  useEffect(() => {
    if (tutorialStatus) {
      if (tutorialStatus.tutorialDisabled) {
        setIsVisible(false);
      } else if (tutorialStatus.tutorialCompleted) {
        setCurrentStep(TUTORIAL_STEPS.length);
        setIsVisible(showOnMount);
      } else {
        setCurrentStep(tutorialStatus.tutorialStep || 1);
      }
    }
  }, [tutorialStatus, showOnMount]);

  // Type out the message
  useEffect(() => {
    let currentMessage = message || TUTORIAL_STEPS.find(s => s.step === currentStep)?.message || '';
    
    if (currentMessage === displayedMessage) return;
    
    setIsTyping(true);
    setDisplayedMessage('');
    
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < currentMessage.length) {
        setDisplayedMessage(prev => prev + currentMessage.charAt(i));
        
        // Play cluck sound effect
        if (soundEnabled && i % 4 === 0) {
          playCluckSound();
        }
        
        i++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, 30);
    
    return () => clearInterval(intervalId);
  }, [currentStep, message]);

  // Function to play cluck sound
  const playCluckSound = () => {
    if (!audioRef.current) return;
    
    // Clone the audio element and play it for overlapping sounds
    const sound = audioRef.current.cloneNode() as HTMLAudioElement;
    sound.volume = 0.3;
    sound.play().catch(err => console.error("Error playing sound:", err));
  };

  // Function to go to the next step
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateStepMutation.mutate(nextStep);
    } else {
      // Complete the tutorial if we're at the last step
      completeTutorialMutation.mutate();
    }
  };

  // Function to go to the previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateStepMutation.mutate(prevStep);
    }
  };

  // Function to skip the tutorial
  const handleSkip = () => {
    disableTutorialMutation.mutate();
  };

  // Function to toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Early return if not visible
  if (!isVisible) return null;

  return (
    <>
      {/* Hidden audio element for clucking sound */}
      <audio ref={audioRef} preload="auto" src="/assets/cluck.mp3" />
      
      <div className="fixed bottom-20 left-4 z-50 flex flex-col items-start">
        {/* Chicken character */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        >
          <img 
            src={`/assets/chicken-assistant-${TUTORIAL_STEPS.find(s => s.step === currentStep)?.emotion || 'normal'}.svg`} 
            alt="Talking Chicken" 
            className="w-24 h-24"
          />
        </motion.div>

        {/* Speech bubble */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="bg-white border-2 border-amber-400 rounded-2xl p-4 mt-2 shadow-lg relative max-w-sm"
            >
              {/* Triangle connector to chicken */}
              <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-r-8 border-b-8 border-amber-400 border-t-transparent border-b-transparent"></div>
              
              {/* Message */}
              <p className="text-gray-800 min-h-[80px]">
                {displayedMessage}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
              
              {/* Controls */}
              {showControls && (
                <div className="flex justify-between mt-4 pt-2 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleSound}
                      aria-label={soundEnabled ? "Mute" : "Unmute"}
                    >
                      {soundEnabled ? <Volume2 size={16} /> : <Volume2Off size={16} />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSkip}
                      aria-label="Skip tutorial"
                    >
                      <XCircle size={16} className="mr-1" />
                      Skip
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep <= 1 || isTyping}
                      aria-label="Previous step"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleNext}
                      disabled={isTyping}
                      aria-label={currentStep >= TUTORIAL_STEPS.length ? "Finish" : "Next step"}
                    >
                      {currentStep >= TUTORIAL_STEPS.length ? "Finish" : "Next"}
                      {currentStep < TUTORIAL_STEPS.length && <ChevronRight size={16} className="ml-1" />}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default TalkingChicken;