import { ReactNode } from "react";
import { Citation, Document } from "./AnswerStep";
import { CitationCard } from "./CitationCard";
import { TrackedLink } from "./TrackedLink";

export const CitationPopup = ({
  citation,
  documents,
  children,
}: {
  citation: Citation;
  documents: Document[];
  children: ReactNode;
}) => {
  const docs = documents.filter((doc) => citation.documentIds.includes(doc.id));

  if (!citation) return null;

  const id = citation.start + "-" + citation.end;

  return (
    <span className="group relative">
      <span className="cursor-pointer text-orange-300" data-tooltip-target={id}>
        {children}
      </span>
      <div
        id={id}
        className="pointer-events-none absolute right-0 z-10 opacity-0 transition-all duration-200 ease-in-out group-hover:opacity-100"
      >
        <div className="mt-[-5px] flex max-w-[300px] flex-row gap-2 overflow-x-auto rounded-lg bg-popover shadow-lg group-hover:pointer-events-auto">
          {docs.map((doc) => (
            <TrackedLink
              href={doc.url}
              key={doc.url}
              target="_blank"
              rel="noreferrer"
              phData={{
                url: doc.url,
              }}
            >
              <CitationCard key={doc.url} citation={doc} />
            </TrackedLink>
          ))}
        </div>
      </div>
    </span>
  );
};
