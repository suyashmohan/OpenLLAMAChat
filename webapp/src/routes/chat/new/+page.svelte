<script lang="ts">
    import "highlight.js/styles/github-dark-dimmed.css";
    import type { PageData } from "./$types";
    export let data: PageData;
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
        <ul class="overflow-auto">
            <li class="text-sm text-gray-600 max-w-3xl mx-auto">
                To get started enter your prompt below
            </li>
        </ul>
        <div
            class="container max-w-3xl mx-auto border-t border-gray-300 mt-2 pt-2"
        >
            <form method="POST" class="flex flex-col md:flex-row">
                <input
                    name="chat_input"
                    id="chat_input"
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
