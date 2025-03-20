import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useUIState } from '@/hooks/use-ui-state';
import TalkingChicken from './talking-chicken';

// Import context messages from the Talking Chicken constants
const CONTEXT_MESSAGES = {
  lowResources: {
    lowWater: {
      message: "Oh no! Your chickens are thirsty! 💧 Visit the Shop to buy water buckets before egg production slows down.",
      emotion: "normal"
    },
    lowWheat: {
      message: "Your chickens are hungry! 🌾 Head to the Shop to buy wheat bags to keep them fed and productive.",
      emotion: "normal"
    },
    lowBoth: {
      message: "Your chickens need both food and water! 🌾💧 Visit the Shop to restock on supplies right away.",
      emotion: "normal"
    }
  },
  readyEggs: {
    message: "Your eggs are ready to be collected! 🥚 Tap on your chickens to gather them and sell at the Market.",
    emotion: "excited"
  },
  unclaimedReferrals: {
    message: "You have unclaimed referral earnings! 💰 Visit the Referrals page to claim your rewards.",
    emotion: "excited"
  },
  spinAvailable: {
    message: "Your daily spin is available! 🎡 Try your luck at the Spin Wheel to win great rewards.",
    emotion: "happy"
  },
  mysteryBoxAvailable: {
    message: "You have unopened Mystery Boxes! 📦 Open them to discover valuable rewards inside.",
    emotion: "excited"
  }
};

export default function ContextSensitiveHelp() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [helpMessage, setHelpMessage] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string>('normal');
  const [showHelp, setShowHelp] = useState(false);
  
  // Query for resources data
  const { data: resources } = useQuery({
    queryKey: ['/api/resources'],
    enabled: !!user
  }) as { data: { waterBuckets: number, wheatBags: number } | undefined };
  
  // Query for chickens data
  const { data: chickens } = useQuery({
    queryKey: ['/api/chickens'],
    enabled: !!user
  }) as { data: Array<{ lastHatchTime: string }> | undefined };
  
  // Query for referral earnings
  const { data: referralEarnings } = useQuery({
    queryKey: ['/api/referrals/earnings'],
    enabled: !!user
  }) as { data: Array<{ claimed: boolean }> | undefined };
  
  // Query for user profile to check spin status
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user
  }) as { data: { tutorialStep: number, tutorialCompleted: boolean, tutorialDisabled: boolean, lastSpinTime: string | null } | undefined };
  
  // Query for mystery box rewards
  const { data: mysteryBoxRewards } = useQuery({
    queryKey: ['/api/mystery-box/rewards'],
    enabled: !!user
  }) as { data: Array<{ claimed: boolean }> | undefined };
  
  useEffect(() => {
    // First-time user login detection
    if (userProfile && userProfile.tutorialStep === 1 && !userProfile.tutorialCompleted) {
      // Returning null as the TalkingChicken component will handle showing the tutorial steps
      return;
    }
    
    // Only show context-sensitive help if tutorial is completed
    if (userProfile?.tutorialCompleted) {
      // Check for low resources
      if (resources) {
        const lowWater = resources.waterBuckets < 5;
        const lowWheat = resources.wheatBags < 5;
        
        if (lowWater && lowWheat) {
          setHelpMessage(CONTEXT_MESSAGES.lowResources.lowBoth.message);
          setEmotion(CONTEXT_MESSAGES.lowResources.lowBoth.emotion);
          setShowHelp(true);
          return;
        } else if (lowWater) {
          setHelpMessage(CONTEXT_MESSAGES.lowResources.lowWater.message);
          setEmotion(CONTEXT_MESSAGES.lowResources.lowWater.emotion);
          setShowHelp(true);
          return;
        } else if (lowWheat) {
          setHelpMessage(CONTEXT_MESSAGES.lowResources.lowWheat.message);
          setEmotion(CONTEXT_MESSAGES.lowResources.lowWheat.emotion);
          setShowHelp(true);
          return;
        }
      }
      
      // Check for ready-to-collect eggs
      if (chickens && chickens.some(chicken => {
        const hatchTime = new Date(chicken.lastHatchTime);
        const now = new Date();
        const diff = now.getTime() - hatchTime.getTime();
        return diff >= 24 * 60 * 60 * 1000; // 24 hours
      })) {
        setHelpMessage(CONTEXT_MESSAGES.readyEggs.message);
        setEmotion(CONTEXT_MESSAGES.readyEggs.emotion);
        setShowHelp(true);
        return;
      }
      
      // Check for unclaimed referral earnings
      if (referralEarnings && referralEarnings.filter(earning => !earning.claimed).length > 0) {
        setHelpMessage(CONTEXT_MESSAGES.unclaimedReferrals.message);
        setEmotion(CONTEXT_MESSAGES.unclaimedReferrals.emotion);
        setShowHelp(true);
        return;
      }
      
      // Check if daily spin is available
      if (userProfile) {
        const lastSpin = userProfile.lastSpinTime ? new Date(userProfile.lastSpinTime) : null;
        const now = new Date();
        
        if (!lastSpin || (now.getTime() - lastSpin.getTime() >= 24 * 60 * 60 * 1000)) {
          setHelpMessage(CONTEXT_MESSAGES.spinAvailable.message);
          setEmotion(CONTEXT_MESSAGES.spinAvailable.emotion);
          setShowHelp(true);
          return;
        }
      }
      
      // Check for unopened mystery boxes
      if (mysteryBoxRewards && mysteryBoxRewards.filter(reward => !reward.claimed).length > 0) {
        setHelpMessage(CONTEXT_MESSAGES.mysteryBoxAvailable.message);
        setEmotion(CONTEXT_MESSAGES.mysteryBoxAvailable.emotion);
        setShowHelp(true);
        return;
      }
    }
    
    // No context-sensitive help needed at this time
    setShowHelp(false);
    
  }, [resources, chickens, referralEarnings, userProfile, mysteryBoxRewards, location]);
  
  if (!showHelp || !helpMessage) return null;
  
  return (
    <TalkingChicken
      showOnMount={true}
      autoOpen={true}
      message={helpMessage}
      showControls={false}
      onSkip={() => setShowHelp(false)}
    />
  );
}