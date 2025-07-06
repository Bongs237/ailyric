# What is this abomination???
Basically think of it as [Cursor AI](https://cursor.com/en) but for writing song lyrics (kinda). It's a text editor, but you get suggestions for lyrics and rhymes as you type.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# How do I set this up bruh

### Clone this repo (duh)
On the GitHub page of this repo, click on the green code button. You should see a URL.

Then in your terminal, run
```bash
git clone <that URL>
```

### Configure your env file
Copy the file called `.env.example` at the root directory of this repo. Call this new file `.env` or `.env.local`.

This is your environment variable file. Inside the file, you should be able to fill in your OpenAI API key, and whether you want to use LLM7.io (a third party LLM provider) instead of OpenAI's. And maybe more if I decide to add more settings.

Lastly, run the development server:
```bash
npm run dev
```

### Open [http://localhost:3000](http://localhost:3000) with your browser to see the result 💅
