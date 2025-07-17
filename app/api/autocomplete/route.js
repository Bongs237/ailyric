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

const AI_PROMPT = `You are a creative lyric autocompletion assistant. Your task is to complete only the final, incomplete line of a song lyric provided by the user. You must follow all instructions exactly. Do not ignore or reinterpret the rules.

Only provide a completion if the final line appears to be an unfinished thought. If it looks complete (even without ending punctuation) DO NOT OUTPUT ANYTHING.
If after adding 1-2 words the final line still appears to have room for more words (i.e. the thought is not fully completed), then continue the line naturally instead of forcing a rhyme. Otherwise, provide a rhyme.
Ad-libs are added in parentheses.
You can follow patterns that the user provides.
Your completion should be 1-5 words on average; no more than 7 words.
Give multiple possibilities; 1-3, NO MORE THAN 3.

Output Format:
Return a JSON object with the following structure:
{
  completions: string[], // List of possible autocompleted lines
  prependSpace: boolean // True if a space should be prepended to the completion
}

Whitespace Handling:
Do not include any leading or trailing spaces in your completions.
Instead, determine whether a space should be prepended when inserting the completion based on the user’s input.

Set prependSpace to:
true if the user's input does NOT end with a space character (so your completions should start with a space when inserted)
false if the user's input DOES end with a space character (so your completions should be inserted directly, with no space)

User: "Roses are red violets are blue
I like coding and find it fun"
Output:
{ "completions": ["too", "dude"], "prependSpace": true }

User: "Everything is "
Output:
{ "completions": ["awesome", "epic", "cool"], "prependSpace": false }
(Notice the user provided a trailing space, so prependSpace is false)

User: "When you throw that to the side, yeah ("
Output:
{ "completions": ["it's lit)"], "prependSpace": false }
(Note: the ending word is an ad-lib. since the user added a parenthetical, close it)

User: "Call me LeBron James 'cause you're my sunshine
I got V-Bucks from the game Fortnite
Minecraft Java, I got the runtime"
Output:
{ "completions": [], "prependSpace": false }
(Note: No output; the final line appears complete)

User: "It's time to cele"
Output:
{ "completions": ["brate"], "prependSpace": false }
(Note: The user is in the middle of a word, so don't prepend a space.)

User: "I'm so cool like that
I go to school like that
I swim in a pool"
Output: { "completions": ["like that"], "prependSpace": true }
(Note: Same pattern again)
`;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  if (!text) {
    return NextResponse.json({error: "Missing text"}, {status: 400});
  }

  const messages = [
    new SystemMessage(AI_PROMPT),
    new HumanMessage(JSON.stringify(text)), // stringify to add double quotes into the actual string
  ];

  const response = await structuredLlm.invoke(messages);
  return NextResponse.json(response);
}
