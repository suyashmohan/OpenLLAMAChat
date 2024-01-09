<script lang="ts">
    import { useChat, type Message } from "ai/svelte";
    import { Marked } from "marked";
    import { markedHighlight } from "marked-highlight";
    import hljs from "highlight.js";
    import "highlight.js/styles/github-dark-dimmed.css";
    import type { PageData } from "./$types";
    export let data: PageData;

    const initialMessages: Message[] = [];
    data.messages.forEach((msg) => {
        type role = "system" | "user" | "assistant" | "function" | "data";
        initialMessages.push({
            id: msg.id.toString(),
            content: msg.content,
            role: msg.role as role,
        });
    });

    const { messages, handleSubmit, input } = useChat({
        initialMessages,
    });

    let chatArea: Element;
    const scrollToBottom = async (node: Element) => {
        node?.scroll({ top: node?.scrollHeight, behavior: "smooth" });
    };
    messages.subscribe(() => {
        scrollToBottom(chatArea);
    });

    const marked = new Marked(
        markedHighlight({
            langPrefix: "hljs language-",
            highlight(code, lang, info) {
                const language = hljs.getLanguage(lang) ? lang : "plaintext";
                return hljs.highlight(code, { language }).value;
            },
        }),
    );
</script>

<div class="flex flex-row">
    <section class="w-72 bg-zinc-100 md:block hidden">
        <div class="p-2 text-xl">Open LLAMA Chat</div>
        <ul class="">
            <li class="p-2">Getting Started</li>
        </ul>
    </section>
    <section
        class="flex flex-col h-screen justify-end container max-w-4xl mx-auto p-4"
    >
        <ul class="overflow-auto" bind:this={chatArea}>
            {#each $messages as message}
                <li>
                    {#if message.role === "user"}
                        <div
                            class="bg-zinc-800 text-white p-2 my-2 rounded text-sm"
                        >
                            {@html marked.parse(message.content)}
                        </div>
                    {:else if message.role === "assistant"}
                        <div class="prose prose-zinc max-w-none">
                            {@html marked.parse(message.content)}
                        </div>
                    {/if}
                </li>
            {/each}
            {#if $messages.length === 0}
                <li class="text-sm text-zinc-600">
                    To get started enter your prompt below
                </li>
            {/if}
        </ul>
        <form on:submit={handleSubmit} class="flex flex-col md:flex-row mt-2">
            <input
                bind:value={$input}
                class="flex-grow border border-zinc-800 rounded py-1 px-3 md:mr-2"
                placeholder="Enter your prompt here"
            />
            <button
                type="submit"
                class="md:w-48 bg-zinc-800 text-white rounded my-2 md:my-0 py-1 px-3"
                >Send</button
            >
        </form>
    </section>
</div>
