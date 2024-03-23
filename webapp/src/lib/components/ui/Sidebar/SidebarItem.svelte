<script>
    export let isActive = false;
</script>

<li class="m-2 px-2 py-1 hover:bg-stone-100 {isActive ? 'bg-stone-100' : ''}">
    <slot />
</li>
