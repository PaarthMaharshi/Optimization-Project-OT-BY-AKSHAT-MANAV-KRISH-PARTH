# React Bits components

Copied from [React Bits](https://github.com/DavidHDev/react-bits) (`src/ts-default`) and used under the licence in [LICENSE.md](LICENSE.md): SplitText, BlurText, ShinyText, CountUp, Magnet, ClickSpark, AnimatedContent, BounceCards, ScrollReveal, ScrollStack and ScrollVelocity.

Unchanged except **BounceCards**, which gained `items` and `labels` props so the cards can hold sample timetable posters instead of images, and **ScrollVelocity**, where an unused callback parameter was renamed `_t` to pass this project's strict TypeScript settings.

Other sources used in `src/components/landing/`: the scroll-pinned fan-to-grid follows Codrops' [Scroll-Based Layout Animations](https://github.com/codrops/ScrollBasedLayoutAnimations) (MIT): a pinned, scrubbed switch between two CSS layouts, done here with plain GSAP tweens. It is re-implemented, not copied.
