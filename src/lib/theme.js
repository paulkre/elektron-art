//@ts-check
import { watch } from 'vue';

import { useCssVar } from '@vueuse/core';

import { config } from './';
import { useLocalstorage } from './utils';

const themeVars = {
  bgdark: useCssVar("--bgdark"),
  bg: useCssVar("--bg"),
  bglight: useCssVar("--bglight"),
  bglighter: useCssVar("--bglighter"),
  fg: useCssVar("--fg"),
  fgdark: useCssVar("--fgdark"),
  ticket: useCssVar("--ticket"),
  overlay: useCssVar("--overlay"),
};

const themeValues = [
  {
    bgdark: "#000",
    bg: "#111",
    bglight: "#222",
    bglighter: "#333",
    fg: "#fff",
    fgdark: "#555",
    ticket: "#ffc107",
    overlay: "hsla(0,0%,0%,0.95)",
  },
  {
    bgdark: "#ddd",
    bg: "#fff",
    bglight: "#eee",
    bglighter: "#ddd",
    fg: "#000",
    fgdark: "#ccc",
    ticket: "#f0b400",
    overlay: "hsla(0,0%,100%,0.95)",
  },
];

export const activeTheme = useLocalstorage("elektron_theme", config.theme);

watch(
  activeTheme,
  () =>
    Object.entries(themeValues[activeTheme.value]).forEach(([key, value]) => {
      themeVars[key].value = value;
    }),
  { immediate: true }
);

export const toggleTheme = () => (activeTheme.value = 1 - activeTheme.value);
