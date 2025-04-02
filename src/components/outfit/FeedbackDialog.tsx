
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, mood: string) => void;
}

const FeedbackDialog = ({ open, onOpenChange, onSubmit }: FeedbackDialogProps) => {
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackMood, setFeedbackMood] = useState<string>("");
  
  // Mood options for feedback
  const moodOptions = [
    "Confident",
    "Comfortable",
    "Professional",
    "Stylish",
    "Casual",
    "Uncomfortable",
    "Overdressed",
    "Underdressed"
  ];

  const handleSubmit = () => {
    if (!feedbackRating || !feedbackMood) return;
    onSubmit(feedbackRating, feedbackMood);
    // Reset dialog state
    setFeedbackRating(null);
    setFeedbackMood("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How did you like this outfit?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve future outfit suggestions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Rating</h4>
            <div className="flex justify-center gap-4">
              <Button 
                variant={feedbackRating === 1 ? "default" : "outline"} 
                className={`${feedbackRating === 1 ? "bg-red-500 hover:bg-red-600" : ""} h-auto p-3`}
                onClick={() => setFeedbackRating(1)}
              >
                <ThumbsDown size={24} />
              </Button>
              <Button 
                variant={feedbackRating === 3 ? "default" : "outline"} 
                className={`${feedbackRating === 3 ? "bg-yellow-500 hover:bg-yellow-600" : ""} h-auto p-3`}
                onClick={() => setFeedbackRating(3)}
              >
                <span className="text-2xl">😐</span>
              </Button>
              <Button 
                variant={feedbackRating === 5 ? "default" : "outline"} 
                className={`${feedbackRating === 5 ? "bg-green-500 hover:bg-green-600" : ""} h-auto p-3`}
                onClick={() => setFeedbackRating(5)}
              >
                <ThumbsUp size={24} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">How did this outfit make you feel?</h4>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => (
                <Button 
                  key={mood}
                  variant={feedbackMood === mood ? "default" : "outline"} 
                  className={`text-xs ${feedbackMood === mood ? "bg-fashion-primary hover:bg-fashion-primary/90" : ""}`}
                  onClick={() => setFeedbackMood(mood)}
                >
                  {mood}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare size={14} />
              Additional comments (optional)
            </h4>
            <Textarea 
              placeholder="What did you like or dislike about this outfit?"
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Skip
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!feedbackRating || !feedbackMood}
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
