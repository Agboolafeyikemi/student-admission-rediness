<template>
  <div class="min-h-screen bg-bg font-sans">

    <header class="flex h-16 items-center border-b border-border bg-white px-8">
      <div class="flex items-center gap-2.5">
        <div
          class="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-navy text-[14px] font-bold tracking-[-0.02em] text-teal"
        >
          Ad
        </div>
        <span class="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
          Admmission· Readiness
        </span>
      </div>
    </header>

    <slot />

  </div>
</template>
