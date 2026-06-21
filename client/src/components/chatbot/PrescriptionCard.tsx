import React, { useState } from "react";
import { motion } from "motion/react";
import { Pill, Stethoscope, User, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

interface PrescriptionAnalysis {
  medications: Medication[];
  diagnosis?: string;
  doctorName?: string;
  date?: string;
  notes?: string;
}

interface PrescriptionCardProps {
  analysis: PrescriptionAnalysis;
  imageUrl?: string;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  analysis,
  imageUrl,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showImage, setShowImage] = useState(false);

  const isValid = (val?: string) =>
    val && val !== "Not readable" && val !== "Not found" && val !== "Unable to analyze";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-secondary/5 to-accent/5 dark:from-secondary/10 dark:to-accent/10 rounded-xl border border-secondary/20 dark:border-secondary/30 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-light-text dark:text-dark-text">
            Prescription Analysis
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-light-text/50 dark:text-dark-text/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-light-text/50 dark:text-dark-text/50" />
        )}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-3 pb-3 space-y-3"
        >
          {/* Diagnosis */}
          {isValid(analysis.diagnosis) && (
            <div className="flex items-start gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2.5">
              <Stethoscope className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-light-text/50 dark:text-dark-text/50 uppercase tracking-wider font-medium">
                  Diagnosis
                </p>
                <p className="text-sm text-light-text dark:text-dark-text">
                  {analysis.diagnosis}
                </p>
              </div>
            </div>
          )}

          {/* Medications */}
          {analysis.medications && analysis.medications.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-1">
                <Pill className="w-3.5 h-3.5 text-accent" />
                <p className="text-[11px] text-light-text/50 dark:text-dark-text/50 uppercase tracking-wider font-medium">
                  Medications
                </p>
              </div>
              <div className="space-y-1">
                {analysis.medications.map((med, i) => (
                  <div
                    key={i}
                    className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2.5"
                  >
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">
                      {med.name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {isValid(med.dosage) && (
                        <span className="text-xs text-light-text/60 dark:text-dark-text/60">
                          💊 {med.dosage}
                        </span>
                      )}
                      {isValid(med.frequency) && (
                        <span className="text-xs text-light-text/60 dark:text-dark-text/60">
                          🔄 {med.frequency}
                        </span>
                      )}
                      {isValid(med.duration) && (
                        <span className="text-xs text-light-text/60 dark:text-dark-text/60">
                          📅 {med.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor & Date */}
          <div className="flex flex-wrap gap-3">
            {isValid(analysis.doctorName) && (
              <div className="flex items-center gap-1.5 text-xs text-light-text/60 dark:text-dark-text/60">
                <User className="w-3 h-3" />
                {analysis.doctorName}
              </div>
            )}
            {isValid(analysis.date) && (
              <div className="flex items-center gap-1.5 text-xs text-light-text/60 dark:text-dark-text/60">
                <Calendar className="w-3 h-3" />
                {analysis.date}
              </div>
            )}
          </div>

          {/* Notes */}
          {isValid(analysis.notes) && (
            <p className="text-xs text-light-text/60 dark:text-dark-text/60 italic bg-white/30 dark:bg-gray-800/30 rounded-lg p-2">
              {analysis.notes}
            </p>
          )}

          {/* Image preview */}
          {imageUrl && (
            <div>
              <button
                onClick={() => setShowImage(!showImage)}
                className="text-xs text-secondary hover:underline"
              >
                {showImage ? "Hide prescription" : "View prescription"}
              </button>
              {showImage && (
                <motion.img
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  src={imageUrl}
                  alt="Prescription"
                  className="mt-2 rounded-lg max-h-60 object-contain border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PrescriptionCard;
