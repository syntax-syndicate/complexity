"use client";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useComplexity } from "./complexity";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { TrackedLink } from "./TrackedLink";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

const examples = [
  "Quantum computing vs classical computing?",
  "Artificial intelligence and job markets",
  "New geopolitical developments",
];

export const Start = () => {
  const { ask, loading } = useComplexity();
  const [input, setInput] = useState("");
  const posthog = usePostHog();

  return (
    <div
      className={
        "absolute bottom-0 top-0 flex w-full flex-col items-center justify-center transition-all duration-100 ease-in-out selection:bg-orange-200 selection:text-orange-600"
      }
    >
      <div className="flex w-full flex-col items-center overflow-y-auto md:justify-center ">
        <div className="mb-2 mt-8 flex flex-col items-center justify-between">
          <div className="group mx-auto mb-4 h-16 w-16 items-center justify-center align-middle">
            <Logo swinging={loading} />
          </div>
          <h1 className="text-gradient mb-1 mt-2 cursor-default text-4xl font-medium tracking-tight">
            complexity
          </h1>
        </div>
        <p className="animate-fade-in mb-16 text-center text-lg font-normal text-gray-300 [--animation-delay:400ms]">
          The world's knowledge at your fingertips
        </p>
        <form
          className="flex w-full flex-col items-center gap-4 px-4"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input, true);
            setInput("");
          }}
        >
          <div className="relative w-full max-w-lg">
            <Input
              className="text-md rounded-full border border-orange-50/10 p-4 py-6 pl-6 pr-14 text-orange-50 placeholder:font-thin placeholder:text-gray-400 focus:border-orange-100 focus:bg-primary/5 focus:text-primary"
              placeholder="Ask anything..."
              onChange={(e) => setInput(e.target.value)}
              value={input}
              disabled={loading}
              autoFocus
            />
            <div className="absolute bottom-0 right-0 top-0 flex h-full items-center justify-center">
              <Button
                variant="outline"
                className={cn(
                  "mr-2 h-8 w-8 rounded-full p-0 hover:bg-orange-500",
                  input ? "bg-orange-600" : "bg-gray-800",
                )}
                type="submit"
                disabled={loading || !input}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <h3 className="mt-4 text-xs font-bold uppercase text-gray-200/90 md:mt-8 cursor-default">
            Suggested
          </h3>
          <div className="flex flex-col items-center gap-2 text-center">
            {examples.map((example, i) => (
              <Card
                key={example}
                className="mt-0 w-auto cursor-pointer rounded-xl border bg-[#202222] p-2 px-4 text-sm text-gray-300 hover:border-orange-300/20 hover:bg-primary/10 hover:text-primary"
                onClick={() => {
                  if (loading) return;
                  posthog.capture("Clicked Trending", {
                    text: example,
                    listIndex: i,
                  });
                  setInput(example);
                  ask(example, true);
                }}
              >
                {example}
              </Card>
            ))}
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center">
          <TrackedLink
            href="https://github.com/follgad/complexity"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gradient group"
            phData={{
              linkurl: "https://github.com/follgad/complexity",
            }}
          >
            <span className="flex flex-row items-center gap-2 p-4 px-6">
              <GitHubLogoIcon className="h-4 w-4 text-orange-600 group-hover:text-orange-400" /> Github
            </span>
          </TrackedLink>
        </div>

        <div className="bottom-0 left-0 right-0 flex items-center justify-center pb-6 pt-12 md:hidden">
          <Link href="/about">
            <Button variant="link">
              <p className="text-gray-200">
                About <span className="text-gradient">complexity</span>{" "}
              </p>
              <ArrowRight className="ml-1 inline-block h-4 w-4 text-gray-200" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
