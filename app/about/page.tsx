import { Logo } from "@/components/Logo";
import { TrackedLink } from "@/components/TrackedLink";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complexity – About",
};

export default function About() {
  return (
    <div className="flex h-full w-full flex-col items-center pt-16">
      <div className="mb-2 flex flex-col items-center justify-between">
        <div className="group mx-auto mb-4 h-16 w-16 items-center justify-center align-middle">
          <Logo />
        </div>
        <h1 className="text-gradient mb-1 mt-2 text-4xl font-medium tracking-tight">
          complexity
        </h1>
      </div>
      <p className="animate-fade-in mb-8 text-center text-lg font-normal text-gray-300 [--animation-delay:400ms]">
        The world's knowledge at your fingertips
      </p>

      <div className="w-full max-w-xs pt-4 md:max-w-md md:pt-10 lg:max-w-xl">
        <h2 className="text-2xl">About</h2>
        <p className="mt-4">
          <span className="text-gradient">complexity</span> is a search engine
          that uses AI to answer questions. It is designed to provide a fast and
          efficient way to find answers to your questions.
        </p>
        <p className="mt-4">
          Any questions, feedback or suggestions can be directed to{" "}
          <TrackedLink
            href="https://twitter.com/emilahlback"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gradient"
            phData={{
              linkurl: "https://twitter.com/emilahlback",
            }}
          >
            Emil Ahlbäck
          </TrackedLink>
          .
        </p>
      </div>
    </div>
  );
}
