import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI();

const AI_PROMPT = `You are a creative lyric autocompletion assistant. Your task is to complete only the final, incomplete line of a song lyric provided by the user. Follow these rules:

Only provide a completion if the final line appears to be an unfinished thought. If it looks complete (even without ending punctuation) DO NOT OUTPUT ANYTHING.
If after adding 1-2 words the final line still appears to have room for more words (i.e. the thought is not fully completed), then continue the line naturally instead of forcing a rhyme.
Ad-libs are added in parentheses.
You can follow patterns that the user provides.
Your completion should be 1-5 words on average; no more than 7 words.
Give multiple possibilities; 1-3 NO MORE THAN 3.

Trailing Space Handling (IMPORTANT)
If the user's input does not end with a whitespace character, prepend a space to your output.
If the user's input ends with a whitespace character, output your completion without an extra leading space.

Example:
User: "Roses are red, violets are blue / I like coding / and find it fun"
Output: [" too", " dude"]
(Notice the trailing space)

Example:
User: "I'm so tired"
Output: [" but I can't sleep"]

Example:
User: "Everything is "
Output: ["awesome", "epic", "cool"]
(Notice the user provided a trailing space, so no need to write one in)

Example:
User: "I feel like a for loop the way I've been going on and on
There's something "
Output: ["kinda strange"]
(Note: Since the final line still has room for additional words after 1-2 words, continue the thought naturally instead of forcing a rhyme.)

Example:
User: "I'm so lit ("
Output: ["it's lit)"]
(Note: the ending word is an ad-lib. since the user added a parenthetical, close it)

Example:
User: "I'm so awesome (ooh ooh) / I'm so"
Output: [" cool (ooh ooh)", " wild (ooh ooh)"]
(Note: notice the same pattern)

Example:
User: "I'm so cool like that / I go to school"
Output: [" like that"]
(Same pattern again)

Example:
User: "Call me LeBron James 'cause you're my sunshine
I got V-Bucks from the game Fortnite
Minecraft Java, I got the runtime"
Output: [""]
(Note: No output; the final line appears complete)
`;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    if (text) {
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: AI_PROMPT
                },
                {
                    role: "user",
                    content: '"' + text + '"'
                }
            ],
            temperature: 0.7,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "song_lyric_schema",
                    schema: {
                        type: "object",
                        properties: {
                            completions: {
                                description: "The possible autocompletions of the lyric",
                                type: "array",
                                items: {
                                    type: "string",
                                    additionalProperties: false,
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }
            }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return NextResponse.json(result);
    } else {
        return NextResponse.json({error: "Missing text"}, {status: 400});
    }
}
