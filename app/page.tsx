"use client";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function useComplexity() {
  const query_id = useSearchParams().get("id");
  const router = useRouter();
  const [steps, setSteps] = useState<
    {
      text: string;
      question: string;
      documents: any[];
      citations: any[];
      id?: string;
    }[]
  >([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (query_id) {
        const stored = localStorage.getItem("question_" + query_id);
        if (stored) {
          setSteps(JSON.parse(stored));
        }
      } else {
        setSteps([]);
      }
    }
  }, [query_id]);

  const [updateC, setUpdateC] = useState(0);

  useEffect(() => {
    if (updateC > 0) {
      localStorage.setItem("question_" + query_id, JSON.stringify(steps));
      setUpdateC(0);
    }
  }, [updateC]);

  const ask = useCallback(
    async (input: string, reset = false) => {
      setLoading(true);
      const id = steps[0]?.id ?? Math.random().toString(36).substring(7);
      if (reset) router.push("/?id=" + id);
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: input,
          history: steps.flatMap((step) => [
            { message: step.question, role: "USER" },
            { message: step.text, role: "CHATBOT" },
          ]),
        }),
      });

      console.log(steps);

      setSteps((s) =>
        reset
          ? [{ text: "", question: input, documents: [], citations: [], id }]
          : [
              ...s,
              { text: "", question: input, documents: [], citations: [], id },
            ]
      );

      const reader = response.body.getReader();
      let lines = "";

      const popFirstLine = () => {
        try {
          const index = lines.indexOf("\n");
          const line = lines.slice(0, index);
          if (index > -1) {
            lines = lines.slice(index + 1);
            const json = JSON.parse(line);
            return json;
          }
        } catch (e) {
          console.warn(e);
        }
        return undefined;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        lines += new TextDecoder().decode(value);
        while (true) {
          const json = popFirstLine();
          if (!json) break;
          if (json.eventType === "text-generation") {
            setSteps((s) => {
              const last = s[s.length - 1];
              return s
                .slice(0, -1)
                .concat([{ ...last, text: last.text + json.text }]);
            });
          } else if (json.eventType === "stream-end") {
            setSteps((s) => {
              const last = s[s.length - 1];
              return s.slice(0, -1).concat([
                {
                  ...last,
                  id: id,
                  text: json.response.text,
                  citations: json.response.citations,
                  documents: json.response.documents,
                },
              ]);
            });
          } else if (json.eventType === "search-results") {
            const docs = json.documents;
            setSteps((s) => {
              const last = s[s.length - 1];
              return s.slice(0, -1).concat([
                {
                  ...last,
                  documents: docs,
                },
              ]);
            });
          } else if (json.eventType === "citation-generation") {
            const citations = json.citations;
            setSteps((s) => {
              const last = s[s.length - 1];
              return s.slice(0, -1).concat([
                {
                  ...last,
                  citations: [...last.citations, ...citations],
                },
              ]);
            });
          }
        }
      }

      setUpdateC((c) => c + 1);

      setLoading(false);
    },
    [steps, setSteps, router]
  );

  return { ask, loading, steps };
}

const CitationCard = ({ citation }) => {
  const [image, setImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Tax_revenue_as_a_percentage_of_GDP_%281985-2014%29.png/320px-Tax_revenue_as_a_percentage_of_GDP_%281985-2014%29.png"
  );
  useEffect(() => {
    fetch("/api/meta?q=" + citation.url)
      .then((res) => res.json())
      .then((data) => data && data.image && setImage(data.image));
  });
  return (
    <Card className="w-48 text-sm">
      {image && (
        <div className="w-full h-16 overflow-hidden flex items-center justify-center rounded-t-lg relative">
          <img
            src={image}
            className="w-full h-full object-cover"
            // @ts-ignore
            onError={(e) => (e.target.src = "https://placehold.co/600x400")}
          />
          <div className="absolute inset-0 rounded-t-lg bg-primary opacity-20" />
        </div>
      )}
      <div className="p-2">
        <p
          // max 2 lines and ellipsis
          className="line-clamp-2 overflow-ellipsis"
        >
          {citation.title.slice(0, 300)}
        </p>
      </div>
    </Card>
  );
};

const AnswerStep = ({ step }) => {
  if (!step.text) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-medium mb-4">{step.question}</h1>
        <Skeleton>
          <div className="h-16" />
        </Skeleton>
      </div>
    );
  }
  return (
    <div className="w-full">
      <h1 className="text-2xl font-medium mb-4">{step.question}</h1>
      <h2 className="text-lg font-medium mb-4">Sources</h2>
      {step.documents.length === 0 && (
        <p className="text-sm text-gray-500">No sources used for this query.</p>
      )}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto mb-4">
          {step.documents.map((doc) => (
            <a href={doc.url} key={doc.url} target="_blank" rel="noreferrer">
              <CitationCard citation={doc} />
            </a>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l to-transparent from-black opacity-40 pointer-events-none rounded-r-lg" />
      </div>
      <h2 className="text-lg font-medium mb-4">Answer</h2>
      <p className="whitespace-pre-wrap mb-8">{step.text}</p>
    </div>
  );
};

const Sidebar = () => {
  const router = useRouter();

  let items = [];
  for (const key in localStorage) {
    if (key.startsWith("question_") && localStorage.getItem(key)) {
      items.push(JSON.parse(localStorage.getItem(key)!));
    }
  }

  return (
    <aside className="flex flex-col items-center p-8 bg-primary text-primary-foreground w-64 flex-shrink-0 flex-grow-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <p className="text-md font-medium flex items-center">
              <div className="w-12 h-12">
                <Logo />
              </div>
              Complexity
            </p>
          </Link>
        </div>
      </div>
      <div className="mt-8 w-full">
        <div className="text-xs text-gray-500 font-bold mb-2 uppercase">
          Sessions
        </div>
        {items.length > 0 && (
          <div className="flex flex-col gap-4 w-full overflow-ellipsis">
            {items.map(([item]) => (
              <div
                key={item.id}
                className="w-full overflow-ellipsis line-clamp-2 cursor-pointer text-sm font-medium text-gray-300 hover:text-primary-foreground"
                onClick={() => {
                  router.push("/?id=" + item.id);
                }}
              >
                {item.question}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

function Home() {
  const { ask, loading, steps } = useComplexity();
  const [input, setInput] = useState("");
  const [followUp, setFollowUp] = useState("");

  const examples = [
    // "Inflection founders join Microsoft",
    // "Nvidia powers humanoid robots",
    // "Facebook brings back Poke",
    // "Nvidia unveils Blackwell",
    // "Gemini-powered iPhone features",
    // "YouTube labels Al-made videos",
    "United States sues Apple",
    "Reddit IPO first day pop",
    "Android 15 satellite messaging",
    "GPT-5 release rumors",
    "Neuralink patient chess telepathy",
    "Saudi Arabia $40b Al fund",
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex max-h-screen min-h-screen flex-col items-center justify-between p-24 relative flex-shrink overflow-y-auto flex-grow">
        <div
          className={
            "w-full h-full transition-all duration-100 ease-in-out absolute top-0 flex flex-col items-center " +
            (steps.length > 0 ? "opacity-0 pointer-events-none" : "opacity-100")
          }
        >
          <div className="pt-16 flex flex-col items-center justify-between">
            <div className="w-32 h-32">
              <Logo dark />
            </div>
            <h1 className="text-3xl font-bold">Complexity</h1>
          </div>
          <p className="mb-8">Ask the AI anything.</p>
          <form
            className="w-full flex flex-col items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input, true);
              setInput("");
            }}
          >
            <Input
              className="text-md p-4 py-6 max-w-lg"
              placeholder="Ask anything..."
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <h3 className="text-sm text-gray-500 font-medium mt-8">
              Trending (click one):
            </h3>
            {examples.map((example) => (
              <Card
                key={example}
                className="text-sm text-gray-500 cursor-pointer p-1 px-2 hover:bg-gray-100"
                onClick={() => {
                  setInput(example);
                  ask(example, true);
                }}
              >
                {example}
              </Card>
            ))}
          </form>
        </div>

        {steps.map((step, i) => (
          <AnswerStep key={step.id + i} step={step} />
        ))}

        <div className="w-full max-w-2xl w-2xl sticky bottom-0 flex items-center justify-between p-16 drop-shadow-lg pointer-events-none">
          {steps.length > 0 && (
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                ask(followUp);
                setFollowUp("");
              }}
            >
              <Input
                className="text-md p-4 py-6 bg-white shadow-md rounded-xl w-full pointer-events-auto"
                placeholder="Ask a follow-up question..."
                onChange={(e) => setFollowUp(e.target.value)}
                value={followUp}
              />
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Main() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}
