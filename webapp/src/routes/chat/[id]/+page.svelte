<script lang="ts">
    import { onMount } from "svelte";
    import { useChat, type Message } from "ai/svelte";
    import { Marked } from "marked";
    import { markedHighlight } from "marked-highlight";
    import hljs from "highlight.js";
    import "highlight.js/styles/github-dark-dimmed.css";
    import type { PageData } from "./$types";
    export let data: PageData;

    const initialMessages: Message[] = [];
    const conversationId = data.conversationId;
    let form: HTMLFormElement;

    if (data.messages && data.messages.length > 1) {
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

    onMount(() => {
        if (
            data.messages &&
            data.messages.length === 1 &&
            data.messages.at(0)?.role == "user"
        ) {
            input.set(data.messages.at(0)?.content || "");
            form.dispatchEvent(new Event("submit"));
        }
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

<div class="flex flex-row bg-stone-100 text-cyan-900">
    <section class="w-72 bg-stone-200 md:block hidden">
        <div class="m-2 p-2">OpenLLAMAChat</div>
        <ul class="text-sm">
            <a data-sveltekit-reload href="/chat/new"
                ><li
                    class="m-2 px-2 py-1 bg-stone-300 text-center hover:bg-stone-100"
                >
                    New Chat
                </li></a
            >
            {#each data.conversations as conversation}
                <a data-sveltekit-reload href="/chat/{conversation.id}"
                    ><li class="m-2 px-2 py-1 rounded-md hover:bg-stone-100">
                        {conversation.label.length > 60
                            ? `${conversation.label.substring(0, 60)}...`
                            : conversation.label}
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
                        <div class="max-w-3xl mx-auto bg-stone-200 p-2 my-2">
                            {@html marked.parse(message.content)}
                        </div>
                    {:else if message.role === "assistant"}
                        <div class="max-w-3xl mx-auto prose prose-stone">
                            {@html marked.parse(message.content)}
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>
        <div
            class="container max-w-3xl mx-auto border-t border-stone-300 mt-2 pt-2"
        >
            <form
                on:submit={handleSubmit}
                bind:this={form}
                class="flex flex-col md:flex-row"
            >
                <input
                    bind:value={$input}
                    class="flex-grow border border-stone-300 rounded py-1 px-3 md:mr-2"
                    placeholder="Enter your prompt here"
                />
                <button
                    type="submit"
                    class="md:w-24 bg-stone-300 hover:bg-stone-200 rounded my-2 md:my-0 py-1 px-3"
                    >Send</button
                >
            </form>
        </div>
    </section>
</div>
