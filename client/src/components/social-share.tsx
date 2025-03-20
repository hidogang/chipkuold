import { useState } from "react";
import { 
  FacebookShareButton, FacebookIcon,
  TwitterShareButton, TwitterIcon,
  TelegramShareButton, TelegramIcon,
  WhatsappShareButton, WhatsappIcon,
  LinkedinShareButton, LinkedinIcon,
  EmailShareButton, EmailIcon
} from "react-share";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SocialShareProps {
  referralCode: string;
  showTitle?: boolean;
  compact?: boolean;
}

export default function SocialShare({ 
  referralCode, 
  showTitle = true,
  compact = false 
}: SocialShareProps) {
  const [showAllOptions, setShowAllOptions] = useState(false);
  
  const shareUrl = `https://chickfarms.com/signup?ref=${referralCode}`;
  const title = "Join ChickFarms - Earn daily rewards and passive income!";
  const hashtags = ["ChickFarms", "PassiveIncome", "OnlineEarning"];
  const description = `Sign up using my referral code "${referralCode}" and get a 10% bonus on your first deposit! Join ChickFarms today to start earning.`;
  
  const toggleOptions = () => {
    setShowAllOptions(!showAllOptions);
  };
  
  const iconSize = compact ? 32 : 48;
  const roundedClass = "rounded-full overflow-hidden hover:scale-110 transition-transform";
  
  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-3">
          <h3 className="text-lg font-medium">Share Your Referral Link</h3>
          <p className="text-sm text-muted-foreground">Invite friends and earn commission on all their deposits</p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Always visible platforms */}
        <FacebookShareButton url={shareUrl} quote={description} hashtag={`#${hashtags[0]}`} className={roundedClass}>
          <FacebookIcon size={iconSize} round />
        </FacebookShareButton>
        
        <TwitterShareButton url={shareUrl} title={title} hashtags={hashtags} className={roundedClass}>
          <TwitterIcon size={iconSize} round />
        </TwitterShareButton>
        
        <TelegramShareButton url={shareUrl} title={description} className={roundedClass}>
          <TelegramIcon size={iconSize} round />
        </TelegramShareButton>
        
        <WhatsappShareButton url={shareUrl} title={description} className={roundedClass}>
          <WhatsappIcon size={iconSize} round />
        </WhatsappShareButton>
        
        {/* Expandable options */}
        {showAllOptions && (
          <>
            <LinkedinShareButton url={shareUrl} title={title} summary={description} className={roundedClass}>
              <LinkedinIcon size={iconSize} round />
            </LinkedinShareButton>
            
            <EmailShareButton url={shareUrl} subject={title} body={description} className={roundedClass}>
              <EmailIcon size={iconSize} round />
            </EmailShareButton>
          </>
        )}
        
        {/* Toggle button */}
        <Button 
          variant="outline" 
          size="icon" 
          className={`${roundedClass} min-w-[${iconSize}px] h-[${iconSize}px]`}
          onClick={toggleOptions}
        >
          {showAllOptions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>
      
      {!compact && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-sm bg-muted p-2 rounded w-full overflow-hidden text-ellipsis">
                {shareUrl}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  // You can add a toast notification here
                }}
              >
                <Share2 className="mr-2 h-4 w-4" /> Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}