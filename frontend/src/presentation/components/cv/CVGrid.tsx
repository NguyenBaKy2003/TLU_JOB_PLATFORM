"use client";

import type { OnlineCV } from "@/domain/models/Cv";
import { CVCard } from "./CVCard";

interface Props {
  cvs: OnlineCV[];
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

export function CVGrid({ cvs, onDuplicate, onDelete, onPublish, onArchive, onRestore }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {cvs.map((cv) => (
        <CVCard
          key={cv.id}
          cv={cv}
          onDuplicate={() => onDuplicate(cv.id)}
          onDelete={() => onDelete(cv.id)}
          onPublish={() => onPublish(cv.id)}
          onArchive={() => onArchive(cv.id)}
          onRestore={() => onRestore(cv.id)}
        />
      ))}
    </div>
  );
}