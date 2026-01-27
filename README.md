## Dev Notes

- First it was `tsup`, then `tsdown` since `tsup`'s
  deprecation notice on their README. `tsdown` unfortunately
  lied about being a drop-in replacement because they don't
  support Stage 3 decorators. Motherfuckers. I'll probably
  switch everything back to using `tsup`...
