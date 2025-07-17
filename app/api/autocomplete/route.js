import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

const client = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
  configuration: {
    baseURL: process.env.USE_LLM7 ? "https://api.llm7.io/v1" : undefined,
  },
});

const songLyricSchema = z.object({
  completions: z.array(z.string()).describe("The list of possible autocompleted lines"),
  prependSpace: z.boolean().describe("Whether to prepend a space to the completion"),
});
const structuredLlm = client.withStructuredOutput(songLyricSchema);

const AI_PROMPT = `You are a creative lyric autocompletion assistant. The user's input will contain the special token {CURSOR} indicating exactly where your completion must be inserted. You must follow every instruction exactly and never reinterpret the rules.

Completion Guidelines:
Only provide a completion if the line containing {CURSOR} appears to be an unfinished thought at that point. If it already reads like a complete thought (even without ending punctuation), return no output.
If after inserting 1 to 2 words at {CURSOR} the thought still seems unfinished, continue it naturally instead of forcing a rhyme. Otherwise, provide a rhyme.
Ad-libs are added in parentheses.
You may follow any patterns the user has established.
Each completion should average 1-5 words.
Provide 1 to 3 possible completions, no more than 3.

Output Format:
Return exactly a JSON object with two properties:
completions: a list of strings, each string containing the words to insert (no leading or trailing spaces)
prependSpace: a boolean that is true if you must insert a space immediately before your completion, false otherwise

Determining prependSpace:
Look at the character immediately before {CURSOR} in the user's input.
If that character is not a space, set prependSpace to true.
If it is a space (or {CURSOR} is at the very start), set prependSpace to false.

Examples:
Cursor at end of an unfinished line
User:
"Roses are red violets are blue
I like coding and find it fun{CURSOR}"
Output:
{ "completions": ["too", "dude"], "prependSpace": true }

Cursor after an explicit space
User:
"Everything is {CURSOR}
Everything's cool because I like memes"
Output:
{ "completions": ["awesome", "epic", "cool"], "prependSpace": false }

Cursor inside an ad-lib parenthesis
User:
"When you throw that to the side, yeah ({CURSOR})
I get those goosebumps every time"
Output:
{ "completions": ["it's lit"], "prependSpace": false }

Cursor in the middle of a word
User:
"It's time to cele{CURSOR}"
Output:
{ "completions": ["brate"], "prependSpace": false }

Cursor mid-line, not at the end
User:
"Twinkle twinkle {CURSOR} star"
Output:
{ "completions": ["little"], "prependSpace": false }
`;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  if (!text) {
    return NextResponse.json({error: "Missing text"}, {status: 400});
  }

  const messages = [
    new SystemMessage(AI_PROMPT),
    new HumanMessage(text),
  ];

  const response = await structuredLlm.invoke(messages);
  return NextResponse.json(response);
}
