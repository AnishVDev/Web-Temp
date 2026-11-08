import type { ModuleSlug } from "./types";

export type ArenaQuestion = {
  id: string;
  module: ModuleSlug;
  /** lesson slug — questions are only served once this lesson is cleared */
  lesson: string;
  /** 1 = recall · 2 = apply · 3 = analyze */
  tier: 1 | 2 | 3;
  q: string;
  options: string[];
  answer: number;
};

const Q = (
  id: string,
  module: ModuleSlug,
  lesson: string,
  tier: 1 | 2 | 3,
  q: string,
  options: string[],
  answer: number,
): ArenaQuestion => ({ id, module, lesson, tier, q, options, answer });

export const ARENA_BANK: ArenaQuestion[] = [
  /* ───────────── MODULE 01 · not-magic ───────────── */
  Q("f0-1", "foundations", "not-magic", 1, "Which statement best describes how most of today's AI works?", ["It follows only rules written by hand", "It learns patterns from a very large number of examples", "It copies the structure of a human brain", "It searches the web and summarizes what it finds"], 1),
  Q("f0-2", "foundations", "not-magic", 1, "What does \"narrow AI\" mean?", ["AI that runs on small devices", "AI built for one task or a small set of related tasks", "AI that only works for a few hours a day", "AI with very few users"], 1),
  Q("f0-3", "foundations", "not-magic", 1, "What is an algorithm?", ["A set of step-by-step instructions a computer follows", "A type of robot", "A collection of labeled photos", "A kind of neural network weight"], 0),
  Q("f0-4", "foundations", "not-magic", 2, "A spam filter built from hand-written rules breaks when spammers change \"winner\" to \"w1nner.\" What does this show?", ["Rules can never be written for email", "Hand-written rules are hard to keep up to date when patterns change quickly", "Spam is impossible to filter", "Computers can't read numbers"], 1),
  Q("f0-5", "foundations", "not-magic", 2, "Which task is a better fit for machine learning than for hand-written rules?", ["Converting Celsius to Fahrenheit", "Deciding whether a photo contains a dog", "Adding up the items in a shopping cart", "Sorting a list of names alphabetically"], 1),
  Q("f0-6", "foundations", "not-magic", 2, "A music app keeps recommending songs you like. Based on Module 01, what is it most likely doing?", ["Understanding your emotions", "Finding patterns in listening data from many users", "Reading the lyrics for their meaning", "Asking musicians for advice"], 1),
  Q("f0-7", "foundations", "not-magic", 3, "A headline says \"AI program decides it wants to take over.\" What is the most reasonable response based on the lesson?", ["Believe it — AI systems have their own goals", "Be skeptical — current AI systems do not have wants or goals of their own", "Assume it's describing AGI, which already exists", "Assume the program was simply coded badly"], 1),
  Q("f0-8", "foundations", "not-magic", 3, "A chess program and a music recommender are both called \"AI.\" What do they actually have in common?", ["Each can do the other's job", "Each finds patterns learned from many examples to do one specific task", "Each understands the world the way a person does", "Each is an example of AGI"], 1),
  Q("f0-9", "foundations", "not-magic", 3, "Someone claims an AI that can learn anything a human can has already been built. According to the lesson…", ["That's correct — chatbots count as AGI", "AGI does not exist yet, and experts disagree about if or when it will", "AGI was first built in 2018", "AGI is just another name for narrow AI"], 1),

  /* ───────────── MODULE 01 · learning-from-data ───────────── */
  Q("f1-1", "foundations", "learning-from-data", 1, "In supervised learning, what is a \"label\"?", ["The correct answer for a training example", "The name of the model", "The model's confidence score", "A sticker on the computer"], 0),
  Q("f1-2", "foundations", "learning-from-data", 1, "Most machine learning projects need which three ingredients?", ["Data, labels, and a learning algorithm", "A screen, a keyboard, and a mouse", "Code, Wi-Fi, and a battery", "Rules, logic, and tests"], 0),
  Q("f1-3", "foundations", "learning-from-data", 1, "What happens in one pass of the training loop?", ["The model guesses, compares to the label, and adjusts slightly", "The model deletes the example", "A person rewrites the code", "The model asks a human for the answer"], 0),
  Q("f1-4", "foundations", "learning-from-data", 2, "A model scores 99% on its training data but only 60% on new data. What is the most likely problem?", ["Underfitting", "Overfitting", "Too much data", "Too many labels"], 1),
  Q("f1-5", "foundations", "learning-from-data", 2, "Why must a model be tested on data it has never seen?", ["To check that it learned general patterns instead of memorizing examples", "Because training data is deleted after training", "To make training faster", "To create more labels"], 0),
  Q("f1-6", "foundations", "learning-from-data", 2, "In the Zorps vs. Blips lab, you give Zorps 40 examples and Blips only 3. What is the likely result?", ["The model labels most new creatures as Zorps", "The model ignores Zorps completely", "Predictions are perfectly balanced", "The model refuses to predict"], 0),
  Q("f1-7", "foundations", "learning-from-data", 3, "A face-unlock feature works well for most people but fails often for one group. What is the most useful question to ask?", ["Is the phone fully charged?", "What data was the model trained on, and who was underrepresented?", "Which app store was it downloaded from?", "How many pixels does the camera have?"], 1),
  Q("f1-8", "foundations", "learning-from-data", 3, "A model is \"very confident\" about a creature unlike anything in its training data. What should you conclude?", ["Confident means it is correct", "Confidence is not the same as accuracy, especially on unfamiliar examples", "The model is broken", "The creature must be a Zorp"], 1),
  Q("f1-9", "foundations", "learning-from-data", 3, "Which change would most directly reduce overfitting?", ["Training on more varied examples", "Training longer on the same few examples", "Removing the test data", "Raising the confidence threshold"], 0),

  /* ───────────── MODULE 01 · neural-networks ───────────── */
  Q("f2-1", "foundations", "neural-networks", 1, "What is a weight in a neural network?", ["An adjustable number that controls how much an input matters", "How heavy the hardware is", "The network's final answer", "A type of training label"], 0),
  Q("f2-2", "foundations", "neural-networks", 1, "In \"deep learning,\" what does \"deep\" refer to?", ["Deep thinking", "Many layers", "Data from the deep ocean", "A very long training time"], 1),
  Q("f2-3", "foundations", "neural-networks", 1, "What does a single artificial neuron do?", ["Multiplies inputs by weights, adds them, and passes the total through a function", "Stores a small picture", "Searches the web", "Writes a line of code"], 0),
  Q("f2-4", "foundations", "neural-networks", 2, "Before training begins, the weights in a network are…", ["Already set to perfect values", "Random, so the network's answers are basically meaningless", "Copied from a human brain", "All zero and stay that way"], 1),
  Q("f2-5", "foundations", "neural-networks", 2, "In an image-recognition network, early layers often respond to ____ and later layers to ____.", ["Faces; edges", "Edges; shapes and faces", "Colors; sounds", "Words; numbers"], 1),
  Q("f2-6", "foundations", "neural-networks", 2, "What is the job of backpropagation?", ["Figure out how much each weight contributed to the error so it can be adjusted", "Send data back to the user", "Delete wrong answers", "Choose which dataset to use"], 0),
  Q("f2-7", "foundations", "neural-networks", 3, "In the lab, changing one weight made the same input produce a very different output. What does this show?", ["What the network has learned is stored in its weights", "The input was wrong", "Networks are random", "Layers don't matter"], 0),
  Q("f2-8", "foundations", "neural-networks", 3, "Why can't you find \"a picture of a cat\" stored inside a trained network?", ["The picture is encrypted", "The network stores numbers that respond to cat-like patterns, not images", "It deletes images after training", "Cats are too complex to store"], 1),
  Q("f2-9", "foundations", "neural-networks", 3, "Training a large model can take weeks. Based on the lesson, why?", ["The computer is slow to turn on", "Small weight adjustments are repeated across an enormous number of examples", "Humans set each weight by hand", "The internet connection is slow"], 1),

  /* ───────────── MODULE 01 · generative-ai ───────────── */
  Q("f3-1", "foundations", "generative-ai", 1, "What is a token?", ["A chunk of text, such as a word, part of a word, or punctuation", "A coin you pay the AI", "A security password", "A robot's memory card"], 0),
  Q("f3-2", "foundations", "generative-ai", 1, "At its core, what does a language model do over and over?", ["Predicts the next token", "Looks up facts in a database", "Copies a paragraph from Wikipedia", "Asks a human to check"], 0),
  Q("f3-3", "foundations", "generative-ai", 1, "What is a hallucination in AI?", ["Confident, well-written content that is wrong or made up", "A slow response", "A blurry image", "An answer that is too long"], 0),
  Q("f3-4", "foundations", "generative-ai", 2, "For the text \"The capital of France is…\", which next token would get the highest probability?", ["spaghetti", "Paris", "Lyon", "banana"], 1),
  Q("f3-5", "foundations", "generative-ai", 2, "Why does a chatbot sound so knowledgeable?", ["It has verified every fact it writes", "Predicting text well across many topics means it picked up grammar, facts, and styles as patterns", "It can read your mind", "It has real feelings about the topic"], 1),
  Q("f3-6", "foundations", "generative-ai", 2, "A long word like \"unbelievable\" might be processed by a language model as…", ["Exactly one token, always", "Possibly more than one token", "Zero tokens", "A picture"], 1),
  Q("f3-7", "foundations", "generative-ai", 3, "A chatbot gives you a perfectly formatted citation. According to the lesson, how was it produced?", ["By looking it up in a library catalog", "By the same next-token process that produces real citations — so it may be fake", "By a human librarian", "By a verified database check"], 1),
  Q("f3-8", "foundations", "generative-ai", 3, "Which AI output deserves the most careful checking?", ["A brainstorm of essay topics", "A specific statistic with a date and a named source", "A paragraph rewritten in a friendlier tone", "A list of synonyms"], 1),
  Q("f3-9", "foundations", "generative-ai", 3, "Why can't hallucinations be fully eliminated?", ["Developers don't care about them", "Because of how models generate text — it is likely text, not verified text", "The internet is too big to search", "Tokens are too small"], 1),

  /* ───────────── MODULE 02 · prompt-anatomy ───────────── */
  Q("t0-1", "toolkit", "prompt-anatomy", 1, "The five prompt ingredients are Role, Task, Context, Format, and…", ["Constraints", "Tone", "Length", "Audience"], 0),
  Q("t0-2", "toolkit", "prompt-anatomy", 1, "\"You are a patient biology tutor\" is which ingredient?", ["Role", "Format", "Constraints", "Task"], 0),
  Q("t0-3", "toolkit", "prompt-anatomy", 1, "What does \"zero-shot\" mean?", ["Asking the AI to do something without giving it any examples", "Giving the AI many examples", "Asking the same question twice", "Using as few words as possible"], 0),
  Q("t0-4", "toolkit", "prompt-anatomy", 2, "\"Give me hints instead of the answer\" is an example of which ingredient?", ["Constraints", "Role", "Context", "Format"], 0),
  Q("t0-5", "toolkit", "prompt-anatomy", 2, "You want the answer as a table instead of paragraphs. Which ingredient should you add?", ["Format", "Role", "Task", "Constraints"], 0),
  Q("t0-6", "toolkit", "prompt-anatomy", 2, "Your prompt is \"help with my essay.\" Which rewrite adds the most useful TASK?", ["\"List 5 counterarguments to my thesis\"", "\"Help with my essay, please\"", "\"You are an essay expert\"", "\"Make it good\""], 0),
  Q("t0-7", "toolkit", "prompt-anatomy", 3, "The AI's responses keep coming back generic. Based on the lesson, what is the most likely cause?", ["Your prompt left out details, so the AI had to guess", "The AI model is too weak", "Your prompt was too specific", "You used too many ingredients"], 0),
  Q("t0-8", "toolkit", "prompt-anatomy", 3, "You ask a quick fact question like \"What year did WWI start?\" Do you need all five ingredients?", ["Yes, every prompt needs all five", "No — a quick fact question usually doesn't need a role or constraints", "Only Format is required", "Only Role is required"], 1),
  Q("t0-9", "toolkit", "prompt-anatomy", 3, "Which prompt includes CONTEXT?", ["\"Explain photosynthesis\"", "\"I'm a 10th grader who already understands chlorophyll. Explain the light reactions.\"", "\"Explain photosynthesis in a table\"", "\"You are a tutor\""], 1),

  /* ───────────── MODULE 02 · iterate-like-pro ───────────── */
  Q("t1-1", "toolkit", "iterate-like-pro", 1, "What is few-shot prompting?", ["Including examples of what you want inside your prompt", "Limiting yourself to a few attempts", "Writing very short prompts", "Asking several short questions"], 0),
  Q("t1-2", "toolkit", "iterate-like-pro", 1, "What is chaining?", ["Breaking a big task into a series of smaller prompts you guide step by step", "Linking two different AIs together", "Repeating one prompt until it works", "Copying one answer into another chat"], 0),
  Q("t1-3", "toolkit", "iterate-like-pro", 1, "The AI says \"This essay is excellent!\" What is the strongest follow-up?", ["\"Be critical. Identify my 3 weakest arguments and how to fix them.\"", "Submit the essay", "\"Thanks!\"", "\"Make it longer\""], 0),
  Q("t1-4", "toolkit", "iterate-like-pro", 2, "The explanation is accurate but dense and hard to follow. What is the best move?", ["Reread it several times", "\"Re-explain it as a story with characters, then quiz me\"", "Start a new chat with the same prompt", "Accept it as the best you'll get"], 1),
  Q("t1-5", "toolkit", "iterate-like-pro", 2, "The AI's code doesn't match the style your teacher requires. What is the best move?", ["Paste an example from class and ask it to match that style exactly", "Ask it to \"make it simpler\"", "Ask for more comments", "Switch programming languages"], 0),
  Q("t1-6", "toolkit", "iterate-like-pro", 2, "When you chain prompts for an essay, who decides the angle and the standard of quality?", ["The AI", "You", "The teacher", "Nobody — it's automatic"], 1),
  Q("t1-7", "toolkit", "iterate-like-pro", 3, "Why is \"Give me 5 versions\" more useful than accepting one answer?", ["One answer is a single guess; several let you choose the best fit", "Longer output is always better", "It makes the AI smarter", "It uses fewer tokens"], 0),
  Q("t1-8", "toolkit", "iterate-like-pro", 3, "Compare \"Make it better\" with \"Identify the three weakest points and fix each one.\" Why is the second stronger?", ["It gives the AI clear direction instead of leaving it guessing", "It is longer", "It is more polite", "It contains a number"], 0),
  Q("t1-9", "toolkit", "iterate-like-pro", 3, "Why is starting a new chat and typing the exact same prompt again a weak strategy?", ["It gives the AI no new information to work with", "New chats cost money", "The AI remembers and gets annoyed", "It resets your account"], 0),

  /* ───────────── MODULE 02 · trust-verify ───────────── */
  Q("t2-1", "toolkit", "trust-verify", 1, "Why is asking the AI \"Are you sure?\" a weak way to verify a fact?", ["It tends to answer with the same confidence whether it's right or wrong", "It refuses to answer", "It always changes its answer", "It's considered rude"], 0),
  Q("t2-2", "toolkit", "trust-verify", 1, "In 2023, two lawyers were sanctioned because they…", ["Submitted citations to court cases the AI had invented", "Wrote too many pages", "Missed a deadline", "Copied from Wikipedia"], 0),
  Q("t2-3", "toolkit", "trust-verify", 1, "What does \"reading laterally\" mean?", ["Opening other trustworthy sources to see what they say about a claim", "Reading the screen sideways", "Skimming quickly", "Reading the last paragraph first"], 0),
  Q("t2-4", "toolkit", "trust-verify", 2, "What is the first step of the 60-second verification check?", ["Identify claims you can check: dates, quotes, statistics, citations", "Ask the AI again", "Share the claim and see if anyone objects", "Cite the chatbot as your source"], 0),
  Q("t2-5", "toolkit", "trust-verify", 2, "The AI writes \"studies show that…\" What should you do before using that claim?", ["Find the specific study", "Trust it — \"studies show\" means it's verified", "Write \"studies show\" in your own paper too", "Ask the AI which studies and cite whatever it says"], 0),
  Q("t2-6", "toolkit", "trust-verify", 2, "Which claim most needs checking?", ["\"Practice helps you learn\"", "\"A 2019 Stanford study found that 73% of students…\"", "\"Paris is in France\"", "\"Essays usually have an introduction\""], 1),
  Q("t2-7", "toolkit", "trust-verify", 3, "How confident an AI sounds tells you…", ["Nothing about whether it is correct", "That it is correct", "That it is wrong", "That it searched the web"], 0),
  Q("t2-8", "toolkit", "trust-verify", 3, "You search for a statistic the AI gave you. What is one clue it may be invented?", ["It doesn't show up anywhere else, while real ones usually appear in multiple places", "It has a decimal point", "It is a round number", "It is from a recent year"], 0),
  Q("t2-9", "toolkit", "trust-verify", 3, "For schoolwork, which sources are more reliable than a chatbot?", ["Library databases and .edu or .gov sites", "Random blogs", "Screenshots of AI chats", "Another chatbot"], 0),

  /* ───────────── MODULE 02 · study-moves ───────────── */
  Q("t3-1", "toolkit", "study-moves", 1, "What is retrieval practice?", ["Recalling information from memory", "Rereading your notes", "Highlighting the textbook", "Copying notes neatly"], 0),
  Q("t3-2", "toolkit", "study-moves", 1, "\"Don't give me the answer. Ask me questions that help me figure it out.\" Which strategy is this?", ["The Socratic Tutor", "The Translator", "The Listener", "The Feedback Coach"], 0),
  Q("t3-3", "toolkit", "study-moves", 1, "Explaining a concept to the AI and asking it to find gaps in your explanation is…", ["The Listener", "The Quiz Partner", "The Translator", "The Feedback Coach"], 0),
  Q("t3-4", "toolkit", "study-moves", 2, "Which request will best help you remember chapter 4 tomorrow?", ["\"Quiz me on chapter 4 and explain anything I get wrong\"", "\"Summarize chapter 4\"", "\"Write study notes on chapter 4\"", "\"Write my chapter 4 essay\""], 0),
  Q("t3-5", "toolkit", "study-moves", 2, "\"Here's my draft. Don't rewrite it. Point out the 3 weakest spots.\" Which strategy?", ["The Feedback Coach", "The Translator", "The Quiz Partner", "The Socratic Tutor"], 0),
  Q("t3-6", "toolkit", "study-moves", 2, "Why is asking for an analogy an effective way to learn a concept?", ["It connects new ideas to things you already understand", "It makes the explanation shorter", "It forces simpler vocabulary", "It is more entertaining"], 0),
  Q("t3-7", "toolkit", "study-moves", 3, "\"Write my essay on Macbeth\" vs. \"Quiz me on the themes in Macbeth.\" What is the key difference?", ["Who is doing the thinking", "How long the output is", "The tone of the response", "How much it costs"], 0),
  Q("t3-8", "toolkit", "study-moves", 3, "According to the lesson's rule, AI should make the typing easier and the thinking…", ["Better", "Unnecessary", "Slower", "Optional"], 0),
  Q("t3-9", "toolkit", "study-moves", 3, "Which three things does learning research say help you remember?", ["Retrieval practice, spacing, and feedback", "Rereading, highlighting, and cramming", "Summaries, notes, and outlines", "Speed, volume, and length"], 0),

  /* ───────────── MODULE 03 · where-is-the-line ───────────── */
  Q("e0-1", "ethics", "where-is-the-line", 1, "In the coach analogy, a good coach…", ["Gives feedback while you do the work", "Does the exercises for you", "Watches from a distance", "Writes your essay"], 0),
  Q("e0-2", "ethics", "where-is-the-line", 1, "What does the transparency test ask?", ["Would you be comfortable if your teacher read your entire AI conversation?", "Did you save a copy of the chat?", "Did you use a paid tool?", "Did the AI include citations?"], 0),
  Q("e0-3", "ethics", "where-is-the-line", 1, "What is disclosure?", ["Briefly explaining how you used AI", "Hiding that you used AI", "Deleting your chat history", "Asking permission after you submit"], 0),
  Q("e0-4", "ethics", "where-is-the-line", 2, "The assignment says \"no AI assistance.\" You want to use AI just to brainstorm. What should you do?", ["Follow the rule as written, or ask your teacher to clarify", "Use it — brainstorming doesn't count", "Use it and add a disclosure", "Use it for half of the ideas"], 0),
  Q("e0-5", "ethics", "where-is-the-line", 2, "Which use is often acceptable (as long as your teacher allows it)?", ["Getting feedback on a draft you wrote, then revising it yourself", "Submitting AI writing as your own", "Including AI citations you haven't checked", "Using AI during a test"], 0),
  Q("e0-6", "ethics", "where-is-the-line", 2, "Does disclosing your AI use make a prohibited use acceptable?", ["No", "Yes, always", "Only if the note is short", "Only if you also cite it"], 0),
  Q("e0-7", "ethics", "where-is-the-line", 3, "A friend offers prompts that rewrite AI text so detectors won't flag it. What is the real issue?", ["Disguising writing you didn't produce is still submitting someone else's work as your own", "Detectors are perfectly accurate", "The prompts are slow", "The prompts cost money"], 0),
  Q("e0-8", "ethics", "where-is-the-line", 3, "It's 11 p.m. and your essay is due tomorrow. Which option keeps your integrity?", ["\"Here are my 3 rough ideas. Help me pick the strongest and organize it. I'll write it.\"", "\"Write me 900 words on the New Deal.\"", "\"Paraphrase this AI essay so it sounds like me.\"", "\"Summarize the book so I can skip reading it.\""], 0),
  Q("e0-9", "ethics", "where-is-the-line", 3, "You used AI only to understand a hard concept, then wrote everything yourself. What is the best move?", ["Add a short note explaining how you used AI", "Say nothing and hope it never comes up", "List the AI as a co-author", "Delete the conversation"], 0),

  /* ───────────── MODULE 03 · bias ───────────── */
  Q("e1-1", "ethics", "bias", 1, "Bias usually enters an AI system through…", ["Training data and design choices", "Deliberate programming by developers", "Random hardware errors", "The app's color scheme"], 0),
  Q("e1-2", "ethics", "bias", 1, "The 2018 Gender Shades study found the highest error rates for…", ["Darker-skinned women", "Lighter-skinned men", "Everyone equally", "Children"], 0),
  Q("e1-3", "ethics", "bias", 1, "In 2018, Reuters reported Amazon abandoned a recruiting tool that…", ["Downgraded résumés containing the word \"women's\"", "Hired too many people", "Crashed constantly", "Ran too slowly"], 0),
  Q("e1-4", "ethics", "bias", 2, "A hiring model is trained on years of past hires that were mostly one type of candidate. What may it learn?", ["To favor applicants who resemble past hires", "To be automatically fair", "To ignore history", "To hire at random"], 0),
  Q("e1-5", "ethics", "bias", 2, "Why can bias in AI be hard to notice?", ["A computer's output can seem neutral and objective", "It is written in another language", "It happens very rarely", "It is always labeled as bias"], 0),
  Q("e1-6", "ethics", "bias", 2, "A chatbot trained on large amounts of internet text may…", ["Pick up stereotypes that appear in that text", "Have no bias at all", "Only know verified facts", "Refuse to discuss people"], 0),
  Q("e1-7", "ethics", "bias", 3, "An AI tool makes a claim about a neighborhood. What is the best response?", ["Check it against reliable sources, including ones from the people being described", "Accept it, because computers are neutral", "Ask it to be \"20% less biased\"", "Ignore the topic entirely"], 0),
  Q("e1-8", "ethics", "bias", 3, "Why can one biased AI system do more harm than one biased person?", ["It can influence a large number of decisions, and its output appears objective", "It types faster", "It never sleeps", "It can vote"], 0),
  Q("e1-9", "ethics", "bias", 3, "Which prompt best helps you see past a single framing?", ["\"Describe several viewpoints on this issue and the evidence behind each\"", "\"Give me the one correct answer\"", "\"Keep it brief\"", "\"Agree with me\""], 0),

  /* ───────────── MODULE 03 · synthetic-world ───────────── */
  Q("e2-1", "ethics", "synthetic-world", 1, "SIFT stands for Stop, Investigate the source, Find better coverage, and…", ["Trace claims to the original context", "Tweet it", "Trust it", "Take a screenshot"], 0),
  Q("e2-2", "ethics", "synthetic-world", 1, "Why are visual glitches no longer a reliable way to spot fakes?", ["Newer tools make fewer mistakes, and real images can also look strange", "Screens are too small", "Images are compressed", "Glitches are now illegal"], 0),
  Q("e2-3", "ethics", "synthetic-world", 1, "Which is a common warning sign of misleading content?", ["Emotional urgency to share it right now", "A formal tone", "Many citations", "A long, detailed explanation"], 0),
  Q("e2-4", "ethics", "synthetic-world", 2, "A familiar-sounding voice calls urgently asking you to buy gift cards. What should you do?", ["Hang up and contact the person using a number you know is theirs", "Help immediately — you recognize the voice", "Keep talking until you're sure", "Send a smaller amount"], 0),
  Q("e2-5", "ethics", "synthetic-world", 2, "A shocking video is spreading, but no credible outlets have covered it. What is the best first step?", ["Check who originally posted it and whether credible outlets independently report it", "Zoom in for glitches", "Share it with \"not sure if real\"", "Assume it's real because it's video"], 0),
  Q("e2-6", "ethics", "synthetic-world", 2, "A fake-looking screenshot of a classmate is circulating. You should…", ["Not believe or share it without strong evidence that it's real", "Share it to warn others", "Assume it's real", "Edit it and repost"], 0),
  Q("e2-7", "ethics", "synthetic-world", 3, "Why does \"Where did it come from?\" beat \"How does it look?\" when judging media?", ["Source and independent coverage are more dependable than visual inspection", "Appearance never matters", "Sources are always right", "It's simply faster"], 0),
  Q("e2-8", "ethics", "synthetic-world", 3, "A family emergency code word mainly protects against…", ["Voice-cloning scams", "Spam email", "Overfitting", "Hallucinations"], 0),
  Q("e2-9", "ethics", "synthetic-world", 3, "According to the lesson, accurate information will still be accurate after…", ["You take a few minutes to check it", "You share it", "It goes viral", "The post is deleted"], 0),

  /* ───────────── MODULE 03 · your-data ───────────── */
  Q("e3-1", "ethics", "your-data", 1, "The lesson's rule for chatbots: don't enter anything you…", ["Wouldn't be comfortable having other people read", "Can't spell", "Already know", "Found online"], 0),
  Q("e3-2", "ethics", "your-data", 1, "APA and MLA citations for AI typically include…", ["The tool's name, creator, version or date, and information about your prompt", "Your password", "Your home address", "Nothing — AI can't be cited"], 0),
  Q("e3-3", "ethics", "your-data", 1, "Who is responsible for errors in AI-assisted work that you submit?", ["You", "The AI company", "No one", "You and the AI equally"], 0),
  Q("e3-4", "ethics", "your-data", 2, "Which is appropriate to enter into a chatbot?", ["A general question about homework stress, with no names or identifying details", "A classmate's private counseling notes", "Your home address", "A friend's password"], 0),
  Q("e3-5", "ethics", "your-data", 2, "Instead of typing a friend's real name into a chatbot, the lesson suggests…", ["\"A friend who is struggling in chemistry\"", "Their initials and school", "Their username", "Their real name is fine"], 0),
  Q("e3-6", "ethics", "your-data", 2, "Why does it matter whether you're using a school account or a personal account?", ["They may have different rules and privacy protections", "They use different colors", "One is faster", "There is no difference"], 0),
  Q("e3-7", "ethics", "your-data", 3, "Your teacher requires a specific disclosure format, but APA suggests something else. Which should you follow?", ["Your teacher's instructions", "APA", "MLA", "Neither"], 0),
  Q("e3-8", "ethics", "your-data", 3, "An AI-assisted paragraph you submitted contained uncredited copied text. Saying \"the AI wrote that\"…", ["Does not shift responsibility away from you", "Fully excuses you", "Shifts blame to the AI company", "Shifts blame to the original author"], 0),
  Q("e3-9", "ethics", "your-data", 3, "Why should you review a tool's privacy settings?", ["Many services let you limit whether your conversations are used for training", "To change the font", "It's required for students", "To speed up responses"], 0),
];
