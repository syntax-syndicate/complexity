import { cn } from "@/lib/utils";
import { ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { forwardRef, useState } from "react";

export const Feedback = forwardRef<
  HTMLDivElement,
  {
    isVisible: boolean;
    recordFeedback: (feedback: "positive" | "negative") => void;
  }
>(function Feedback(
  props: {
    isVisible: boolean;
    recordFeedback: (feedback: "positive" | "negative") => void;
  },
  ref,
) {
  const { isVisible, recordFeedback } = props;
  const [isFeedbackRecorded, setIsFeedbackRecorded] = useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        "mb-6 mt-2 flex w-full max-w-xs flex-col pt-1 transition-opacity duration-300 ease-in md:max-w-md lg:max-w-xl",
        isVisible ? "opacity-100" : "opacity-0",
        isFeedbackRecorded && "opacity-0 duration-200 ease-out",
      )}
    >
      <div className="flex flex-col">
        <div className="mt-2 flex w-full justify-end gap-1">
          <Button
            variant="outline"
            title="Good answer!"
            className={cn("feedback-button group", "hover:bg-zinc-300")}
            onClick={() => {
              recordFeedback("positive");
              setIsFeedbackRecorded(true);
            }}
          >
            <ThumbsUpIcon className="feedback-icon group-hover:text-gray-500" />
          </Button>
          <Button
            variant="outline"
            title="Bad answer!"
            className={cn("feedback-button group", "hover:bg-zinc-300")}
            onClick={() => {
              recordFeedback("negative");
              setIsFeedbackRecorded(true);
            }}
          >
            <ThumbsDownIcon className="feedback-icon group-hover:text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
});