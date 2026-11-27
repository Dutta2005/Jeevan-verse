import { useState, type FC } from "react";
import { FileText, ExternalLink } from "lucide-react";
import PrescriptionCard from "./PrescriptionCard";
interface Attachment {
  type: "image" | "pdf";
  url: string;
  originalName?: string;
  analysis?: string;
}
// Attachment preview in user messages
export const AttachmentPreview: FC<{ attachment: Attachment }> = ({ attachment }) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-primary/20 bg-primary/5 max-w-[150px] md:max-w-[200px] ml-auto">
      {attachment.type === "image" ? (
        <>
          <img
            src={attachment.url}
            alt={attachment.originalName || "Prescription"}
            className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowFull(!showFull)}
          />
          {showFull && (
            <div
              className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
              onClick={() => setShowFull(false)}
            >
              <img
                src={attachment.url}
                alt="Full prescription"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </>
      ) : (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 hover:bg-primary/10 transition-colors"
        >
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-xs truncate text-light-text dark:text-dark-text">
            {attachment.originalName || "Prescription.pdf"}
          </span>
          <ExternalLink className="w-3 h-3 text-light-text/40 flex-shrink-0" />
        </a>
      )}
    </div>
  );
};

// Prescription analysis block (shown before assistant analysis message)
export const PrescriptionAnalysisBlock: FC<{ attachment: Attachment }> = ({ attachment }) => {
  let analysis;
  try {
    analysis = JSON.parse(attachment.analysis || "{}");
  } catch {
    return null;
  }
  if (!analysis || (!analysis.medications && !analysis.diagnosis)) return null;
  return (
    <PrescriptionCard
      analysis={analysis}
      imageUrl={attachment.type === "image" ? attachment.url : undefined}
    />
  );
};
