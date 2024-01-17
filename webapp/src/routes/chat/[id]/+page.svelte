<script lang="ts">
    import { useChat, type Message } from "ai/svelte";
    import { Marked } from "marked";
    import { markedHighlight } from "marked-highlight";
    import hljs from "highlight.js";
    import "highlight.js/styles/github-dark-dimmed.css";
    import type { PageData } from "./$types";
    export let data: PageData;

    const initialMessages: Message[] = [];
    const conversationId = data.conversationId;

    if (data.messages) {
        data.messages.forEach((msg) => {
            type role = "system" | "user" | "assistant" | "function" | "data";
            initialMessages.push({
                id: msg.id.toString(),
                content: msg.content,
                role: msg.role as role,
            });
        });
    }

    const { messages, handleSubmit, input } = useChat({
        initialMessages,
        body: {
            conversationId,
        },
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

<div class="flex flex-row bg-gray-50">
    <section class="w-72 bg-gray-900 text-white md:block hidden">
        <div class="m-2 p-2 text-md">OpenLLAMAChat</div>
        <ul class="text-sm">
            <a data-sveltekit-reload href="/chat/new"
                ><li
                    class="m-2 p-2 border text-center hover:bg-gray-100 hover:text-gray-800"
                >
                    New Chat
                </li></a
            >
            {#each data.conversations as conversation}
                <a data-sveltekit-reload href="/chat/{conversation.id}"
                    ><li
                        class="m-2 p-2 rounded-md hover:bg-gray-100 hover:text-gray-800"
                    >
                        {conversation.label}
                    </li></a
                >
            {/each}
        </ul>
    </section>
    <section class="flex flex-col h-screen justify-end container mx-auto p-4">
        <ul class="overflow-auto" bind:this={chatArea}>
            {#each $messages as message}
                <li>
                    {#if message.role === "user"}
                        <div
                            class="max-w-3xl mx-auto bg-gray-300 p-2 my-2 rounded text-sm"
                        >
                            {@html marked.parse(message.content)}
                        </div>
                    {:else if message.role === "assistant"}
                        <div class="max-w-3xl mx-auto prose prose-graye">
                            {@html marked.parse(message.content)}
                        </div>
                    {/if}
                </li>
            {/each}
            {#if $messages.length === 0}
                <li class="text-sm text-gray-600 max-w-3xl mx-auto">
                    To get started enter your prompt below
                </li>
            {/if}
        </ul>
        <div
            class="container max-w-3xl mx-auto border-t border-gray-300 mt-2 pt-2"
        >
            <form on:submit={handleSubmit} class="flex flex-col md:flex-row">
                <input
                    bind:value={$input}
                    class="flex-grow border border-gray-800 rounded py-1 px-3 md:mr-2"
                    placeholder="Enter your prompt here"
                />
                <button
                    type="submit"
                    class="md:w-48 bg-gray-800 text-white rounded my-2 md:my-0 py-1 px-3"
                    >Send</button
                >
            </form>
        </div>
    </section>
</div>