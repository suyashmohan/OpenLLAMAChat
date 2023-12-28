<script lang="ts">
    import { useChat } from "ai/svelte";
    import { Marked } from "marked";
    import { markedHighlight } from "marked-highlight";
    import hljs from "highlight.js";
    import "highlight.js/styles/github-dark-dimmed.css";

    const { messages, handleSubmit, input } = useChat();

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

<section class="flex flex-col h-screen justify-end container mx-auto p-2">
    <ul class="overflow-auto" bind:this={chatArea}>
        {#each $messages as message}
            <li>
                {#if message.role === "user"}
                    <div class="bg-zinc-200 p-2 my-2 rounded text-sm">
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
