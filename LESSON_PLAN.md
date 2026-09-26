# Lesson Plan: How Web Apps Work

How to use this: each phase has **Concepts** (read first), **Steps** (do these, in order,
writing every file yourself), and **Checkpoints** (don't move on until you can answer
these). I've included tiny syntax hints in a few places where the API is obscure and
googling it would just waste your time, but no solution code — the goal is for your
hands to write it.

Ask me questions as you go. I can explain a concept again, review code you've written,
or debug something with you — I just won't write the app for you.

---

## Phase 0 — Toolchain: TypeScript + a dev server + "Hello, world"

### Concepts

- **Why a server at all?** A browser can open a `.html` file directly (`file://...`),
  but that origin is special-cased and breaks things you'll need later — `fetch`,
  ES modules (`<script type="module">`), CORS. Serving over `http://localhost` avoids
  all of that, even from a "dumb" file server with no application logic.
- **What TypeScript actually is.** Browsers only run JavaScript. TypeScript is JS plus
  a type-checking layer; the `tsc` compiler *type-checks* your code and then *erases
  the types*, emitting plain `.js`. Nothing about TypeScript runs in the browser — you
  always ship the compiled output.
- **`tsconfig.json`** is the config for `tsc`: which JS version to target, where source
  files live, where output goes, how strict the type checker should be.

### Steps

1. Confirm your tools: `node -v`, `npm -v`, `python3 --version`.
2. `npm init -y` to create a `package.json` (this just marks the folder as an npm
   project and records dependencies — read through the generated file).
3. `npm install --save-dev typescript`.
4. `npx tsc --init` to generate `tsconfig.json`. Open it and find these options —
   set/confirm: `target`, `module`, `rootDir` (e.g. `src`), `outDir` (e.g. `dist`),
   `strict`. Leave the rest at defaults for now.
5. Write `src/main.ts`. Have it do something visible in the page, not just
   `console.log` — e.g. find an element by id and set its `textContent`. (Syntax
   hint if you haven't done DOM typing before: `document.getElementById("x")`
   returns `HTMLElement | null` in TypeScript, so you'll need to narrow it — e.g.
   check it's non-null, or use `!` — before using it.)
6. Write `index.html` at the project root with a target element and a
   `<script type="module" src="dist/main.js"></script>` tag pointing at the
   *compiled* output, not `src/main.ts`.
7. Compile: `npx tsc`. Look at what landed in `dist/`.
8. Serve the project root: `python3 -m http.server 8000`. Visit
   `http://localhost:8000/`.
9. Try `npx tsc --watch` in a second terminal so edits recompile automatically —
   you'll want this for every later phase too.

### Checkpoints

- In your own words, what does `tsc` do to your code? What would happen if you
  linked `src/main.ts` directly from the HTML instead of `dist/main.js`?
- Open `index.html` via `file://` directly in the browser (no server) instead of
  through `localhost:8000`. What breaks, and what does the browser console say?
  Keep this in mind — it's relevant again in Phase 2.

---

## Phase 1 — A todo list (TypeScript + HTML, drag-and-drop reordering)

Build this in small milestones — get each one fully working before the next.

### Concepts

- **State + render pattern.** Keep your todos in one in-memory array (the "state"),
  and write a single `render()` function that clears the list container and rebuilds
  it from that array. Every change to the data is followed by calling `render()`
  again. This is the core idea behind every JS framework you'll ever meet — they
  just automate parts of it.
- **Stable identity.** If you key elements off their position in the array,
  reordering and toggling get confusing fast. Give each todo an `id` (a counter or
  `crypto.randomUUID()`) when it's created, independent of its position.
- **The HTML5 Drag and Drop API.** It's event-driven and a little unintuitive:
  - The dragged element needs `draggable="true"`.
  - `dragstart` fires on the item being picked up — this is where you record *which*
    item is being dragged (e.g. stash its id).
  - `dragover` fires continuously on whatever's under the cursor — you **must** call
    `event.preventDefault()` in this handler, or the drop is rejected. This trips
    everyone up the first time.
  - `drop` fires on the element released onto — this is where you actually reorder
    your array and re-render.

### Steps

1. **Data model**: a TypeScript `interface` for a todo item (id, text, done), and an
   array of them as your app's state.
2. **Render**: a function that renders the array as `<li>` elements (checkbox + text)
   inside a `<ul>`. Call it once at startup with some seed data so you have something
   to look at before "add" works.
3. **Add a todo**: a text `<input>` and a button/form; on submit, push a new item onto
   the array and re-render. Remember to clear the input.
4. **Toggle done**: clicking a checkbox flips that item's `done` field and re-renders
   (or at least toggles a CSS class — try both and think about which is better and
   why).
5. **Delete a todo** (not in the original plan, but you'll want it to test reordering
   sanely): a small delete control per item.
6. **Drag-and-drop reorder**: make each `<li>` draggable, wire up `dragstart` /
   `dragover` / `drop` to splice the dragged item out of the array and back in at the
   new position, then re-render.

### Checkpoints

- Why does `dragover` need `preventDefault()` but `dragstart` doesn't?
- What bug do you get if you key/re-find elements by their array *index* instead of
  by `id`, once delete and reorder both exist? Try to provoke it.
- What happens to a checkbox's checked state across a `render()` call if you rebuild
  the DOM from scratch each time versus mutating just the changed node? Which did
  you implement, and why?

### Stretch (optional)

- Persist the list to `localStorage` so it survives a page reload.
- Make reordering keyboard-accessible (drag-and-drop alone excludes keyboard users).

---

## Phase 2 — Add Vite, and actually observe the bundling effect

### Concepts

- **What a bundler does.** With plain multi-file ES modules
  (`import { x } from "./other.js"`), the browser issues one HTTP request per
  imported module, following the import graph recursively. A bundler statically
  analyzes that graph ahead of time and concatenates everything into one (or a few)
  output file(s), so the browser fetches far fewer files.
- **Important nuance you're asked to "observe":** Vite's *dev server* (`npm run dev`)
  deliberately does **not** bundle — it serves native ES modules on demand (via
  esbuild) so edits show up instantly. The dramatic drop in request count you're
  looking for shows up in the **production build** (`vite build`), not in dev mode.
  Plan to compare three things, not two.

### Steps

1. **Split your Phase 1 code into a few modules** if it isn't already — e.g.
   `todo.ts` (types + state), `render.ts`, `dragdrop.ts`, `main.ts` importing from the
   others. Compile with `tsc` and serve with `python3 -m http.server` as before.
2. **Baseline measurement**: open the browser devtools Network tab, filter to JS,
   hard-reload, and count/record how many `.js` requests fire and roughly how long
   the waterfall takes.
3. **Introduce Vite**: `npm install --save-dev vite`. Restructure per Vite's
   convention — `index.html` at the project root importing `/src/main.ts` directly
   (Vite transpiles TS on the fly; you no longer run `tsc` yourself for serving,
   though you can still run `tsc --noEmit` for type-checking).
4. **Run `npm run dev`**, reload, check the Network tab again. Record the count.
   It should look similar to the baseline (still one request per module) — this is
   the point: dev mode optimizes iteration speed, not request count.
5. **Run `npm run build`**, then serve the generated `dist/` folder (Vite's own
   `npm run preview`, or your `python3 -m http.server` pointed at `dist/`). Check the
   Network tab a third time.
6. Put your three counts in a small table (unbundled / vite dev / vite build) and
   write a sentence explaining the difference between rows 2 and 3, since a lot of
   people expect `vite dev` alone to shrink the request count and it doesn't.

### Checkpoints

- Which of the three setups had the fewest JS requests, and why specifically that one
  and not the others?
- If you add an npm package (e.g. something small and pointless just for this
  experiment) and import it in your code, where does its code end up after
  `vite build`? Check the output file.

### Stretch (optional)

- Look up `import()` (dynamic import) and use it to split one part of your app into
  a separate chunk that only loads when needed. Confirm in the Network tab that it
  loads late.

---

## Phase 2.5 — Build a tiny reactivity system with `Proxy`

A bridge between "manually calling `render()` everywhere" and React's `useState`
magic — build a minimal version of the mechanism yourself so the real thing feels
like an obvious next step rather than a black box.

### Concepts

- **`Proxy`** wraps an object and lets you intercept fundamental operations on it —
  reading a property, setting one, deleting one — via handler functions called
  "traps." A `set` trap runs *before* (or instead of) the actual assignment happens,
  giving you a hook to run arbitrary code — like calling `render()` — any time
  something changes the wrapped object, with no call to remember at the mutation
  site.
- **`Reflect`** is `Proxy`'s usual pairing: inside a trap, `Reflect.set(...)` performs
  the *default* behavior (the assignment that would have happened anyway) so your
  trap can run its extra logic without having to reimplement how normal property
  assignment works.
- This is a real, load-bearing technique — not a toy simplification. Vue 3 and
  SolidJS use `Proxy` for exactly this purpose internally.

### Steps

1. Write a function along the lines of
   `function reactive<T extends object>(target: T, onChange: () => void): T`
   that returns `new Proxy(target, { set(obj, prop, value) { ...; onChange(); return true; } })`
   — using `Reflect.set` inside the trap to actually perform the write.
2. Wrap your `todos` array with it, passing `render` as `onChange`, and use the
   returned proxy as your `todos` from then on.
3. Delete every manual `render()` call after a mutation that goes through the array
   itself (`add`'s push, `moveItem`'s splices) — the proxy should be the only thing
   triggering `render()` now for those paths.
4. Reload and confirm adding and reordering still update the screen with zero
   explicit `render()` calls left in those code paths.

### Checkpoints

- Try toggling a checkbox now. Does the screen still update correctly with no
  manual `render()` call? If not — why not, given that `item.checked = ...` is a
  `set` operation too? (Hint: think about *which specific object* your `Proxy` is
  wrapping, and where `item` actually comes from.) This is a real, well-documented
  gap in `Proxy`-based reactivity, not a mistake in your implementation.
- `Array.prototype.push` is itself implemented in terms of plain property
  assignment (setting the new index, then setting `.length`). Given that, how many
  times does your `set` trap actually fire for one `push()` call? Add a
  `console.log` inside the trap to check your prediction.
- What would break if your trap just called `onChange()` and returned `true`,
  without calling `Reflect.set` at all?

### Stretch (optional)

- Fix the checkbox gap: write a version that also wraps any nested object/array it
  returns from a `get` trap, so mutations at any depth trigger `onChange`. This is
  "deep reactivity" — look at how much more code it takes than the shallow version.
- Skim how Vue 3's docs describe their reactivity system's own caveats (e.g.
  destructuring breaking reactivity) and see how many of them trace back to the same
  root cause you just hit.

---

## Phase 2.75 — Rebuild a todo row as a native Web Component

Motivated by comparing the browser's own, built-in answer to "GUI toolkit with
self-contained widget objects" (the model you already know from Qt/PyQt and your
own `observed` library) against React's top-down "UI = f(state)" model, *before*
seeing React itself. New sibling directory, e.g. `web-components/` — same
`todo.ts` state layer can likely be reused as-is; what changes is how the DOM gets
built and updated.

### Concepts

- **Custom Elements are real classes, and instances are real DOM elements.** You
  define a class extending `HTMLElement`; `customElements.define("tag-name", Class)`
  registers it; from then on, `<tag-name>` in HTML (or
  `document.createElement("tag-name")`) creates an instance of your class. This is
  the literal browser-native version of "a GUI element is an instance of a class" —
  no virtual DOM, no framework runtime, no build step required at all.
- **Tag names must contain a hyphen** (`todo-item`, not `todoitem`) — a deliberate
  spec requirement so custom tags can never collide with some future native HTML
  element.
- **Lifecycle callbacks**, the closest thing to Qt's constructor/`show()`/`close()`:
  `connectedCallback()` fires when an instance is actually inserted into the
  document — that's normally where you build the element's initial internal DOM,
  analogous to a widget's constructor laying out its children.
- **Properties vs. attributes, again.** You'll expose things like `checked` as a
  plain JS property with a getter/setter (any value, e.g. a `boolean`) — same
  attribute-vs-property distinction that bit you with `dataset` (strings only) and
  `getElementById` (specific element types) earlier. The setter is where "set the
  data, the widget redraws itself" actually happens: writing to it directly patches
  whatever part of the element's internal DOM needs to change — no `render()`, no
  `Proxy`, nothing global involved for this one widget's own display.
- **`CustomEvent` is the signal/slot, `observed`-callback analogue.** A component
  tells the outside world about a user action via
  `this.dispatchEvent(new CustomEvent("todo-delete", { detail: {...}, bubbles: true }))`;
  outside code listens the normal way
  (`addEventListener("todo-delete", handler)`). Structurally the same shape as a Qt
  signal a widget emits and something else connects to — decoupled, and the widget
  doesn't need to know who's listening.

### Steps

1. Scaffold the new directory the same way as `vanilla/` (plain `tsc` +
   `python3 -m http.server`, no bundler needed — Custom Elements need zero build
   tooling to run).
2. Write a `TodoItemElement` class extending `HTMLElement`. In `connectedCallback`,
   build its internal structure once (checkbox, text, delete button) the same
   pieces `render()` used to build per iteration — but now it happens once per
   element instance, not on every global re-render.
3. Add `checked` and `text` as real getter/setter properties on the class; each
   setter updates only the specific internal node that needs to change (e.g. the
   checkbox's `.checked`) — direct, targeted patching, not a rebuild.
4. Wire the checkbox's own `change` listener and the delete button's `click`
   listener *inside the element itself* (this is now natural, not awkward the way
   it was in `render()` — the element manages its own children for its own
   lifetime, so there's no "these get destroyed and recreated every pass" tension
   from the event-delegation discussion). Each dispatches a `CustomEvent`
   (`todo-toggled`, `todo-delete-requested`) rather than calling app logic directly
   — the element shouldn't know `todo.ts` exists at all.
5. `customElements.define("todo-item", TodoItemElement)`.
6. On the "app" side: build/update a list of `<todo-item>` elements from `todos`,
   set their `id`/`text`/`checked` properties, and listen for the `CustomEvent`s
   to call your existing `deleteItem`/`setChecked`/`reorderTodos` from `todo.ts` —
   the state layer doesn't need to change at all, only what sits between it and
   the DOM.

### Checkpoints

- Map the pieces explicitly onto what you already know: what in this design plays
  the role of a Qt widget class? What plays the role of a Qt signal, or a callback
  registered through your `observed` library?
- Where did `render()`/the `Proxy` trick's job go — is there still one global
  "redraw everything" function anywhere, or did that responsibility distribute out
  into each element's own property setters?
- Try keeping the same `<todo-item>` DOM nodes across an update (set their
  properties) versus destroying and recreating them the old way. Does checkbox
  state survive one approach and not the other? This is the same question as the
  Phase 1 checkpoint about checkbox state across a `render()` rebuild — see if the
  answer comes out differently here, and why.
- Why must the tag name contain a hyphen? What actually breaks if you try to
  register one without one?

### Stretch (optional)

- Add real encapsulation with Shadow DOM (`this.attachShadow({ mode: "open" })`).
  Notice what changes — page-level CSS stops leaking in, and DOM queries like
  `.closest()` behave differently across the shadow boundary (event retargeting) —
  a real complication worth hitting once.
- Rebuild the same `<todo-item>` using [Lit](https://lit.dev) (reactive properties
  + a template, declared instead of hand-written) and compare how much of your
  property-setter/DOM-patching code disappears versus the plain-Custom-Element
  version.

---

## Phase 3 — Rebuild the todo app in a UI framework (React) — **skipped**

Kept below for reference, not deleted. After building the `view_calls_model` Web
Components variant — typed callback properties, `makeObservable`, hand-verified
focus preservation across surgical DOM updates — the user made an informed call not
to buy into React's inversion-of-control for this project, having already gotten
most of what a framework would buy him without it. Phase 4 (Lit) and a planned
follow-on look (SolidJS) are the actual next steps; see below.

### Concepts

- **`render()` is a pattern; frameworks industrialize it.** Your Phase 1 `render()` —
  clear the container, rebuild it from `todos` — already *is* the core idea behind
  React, Vue, Svelte, and friends: **UI as a function of state.** What you built by
  hand, a framework gives you two things for free: (1) it calls something like your
  `render()` **automatically** whenever state changes, instead of you remembering to
  call it after every mutation; and (2) it doesn't rebuild the whole DOM subtree from
  scratch each time — it computes what actually changed and patches only that.
- **Components.** Instead of one big `render()` function, a React app is a tree of
  small functions ("components"), each returning a description of what it wants
  on screen, composed like custom HTML tags.
- **State, and the hook that manages it (`useState`).** `useState` gives you a value
  and a setter function. Calling the setter is the thing that triggers a re-render —
  it's the automatic "call `render()` for me" hook you were missing in Phase 1.
- **JSX.** React components are usually written in a syntax that looks like HTML
  embedded in TypeScript/JavaScript, compiled (by Vite, using esbuild) into plain
  function calls. It's a build-time transform, same category of idea as `tsc` erasing
  types — the browser never sees JSX, only what it compiles down to.
- **The virtual DOM, briefly.** React keeps a lightweight in-memory description of
  the UI, compares the new one to the previous one on every state change, and applies
  only the difference to the real DOM. This is *why* it can afford to let you "just
  describe the UI" instead of hand-optimizing which nodes to touch, the way you had
  to think about with `replaceChildren()`.

### Steps

1. Scaffold a fresh React + TypeScript project with Vite: `npm create vite@latest`,
   choosing the React + TypeScript template. Look through what it generates before
   changing anything — compare its `package.json` and file layout to what you built
   by hand in Phases 0–2.
2. Run it (`npm run dev`) and find the one component it starts you with. Identify:
   where's the JSX, where's the `useState` call, what does its markup compile to?
3. **Re-implement your data model** as a `Todo` type/interface (you already have this
   from Phase 1) and hold the list in `useState` instead of a bare module-level array.
4. **Rebuild rendering as JSX**: map over your todos array and return an `<li>` per
   item directly in the component's return value — no `document.createElement`,
   no manual `appendChild`.
5. **Add a todo**: an `<input>` whose value is also `useState`-backed, and a button
   whose `onClick` calls your state setter with the array plus the new item —
   compare this to your Phase 1 `add()`.
6. **Toggle / delete**: `onChange`/`onClick` handlers on each rendered item that call
   the state setter with a new array (not a mutated one — see checkpoints).
7. **Drag-and-drop reorder**: wire the same native HTML5 drag events from Phase 1
   (`onDragStart`, `onDragOver`, `onDrop` — React just gives you these as JSX props)
   to update state the same way.

### Checkpoints

- Find the line in your React version that corresponds to your Phase 1 `render()`
  call. (Hint: you'll have a hard time finding it, because there isn't one — that's
  the point. Explain in your own words what replaced it.)
- React expects you to produce a **new** array/object for state updates rather than
  mutating the existing one in place (e.g. `setTodos([...todos, newItem])`, not
  `todos.push(newItem)`). Try mutating in place instead and see what happens (or
  doesn't happen) on screen. Why do you think React is built to care about this,
  given how it decides whether to re-render?
- Line-count or eyeball-compare your Phase 1 `main.ts` against your Phase 3
  component for the same feature set. Which parts got shorter? Is anything *harder*
  to see or reason about in the React version than it was in the vanilla one?

### Stretch (optional)

- Look at what `vite build` produces for this project versus your Phase 2 vanilla
  build — how much of the bundle is your code versus React itself?
- Skim the React docs' explanation of the virtual DOM / reconciliation and see how
  close your own mental model (from the Concepts section above) matches theirs.

---

## Phase 4 — Rebuild the todo app in Lit

Unlike React, this one builds *directly* on ground you've already covered twice —
Lit is a thin layer on top of the same Custom Elements API `TodoItemElement`/
`TodoListElement` already use, not a new paradigm to learn from scratch.

### Concepts

- **`LitElement` is still just `HTMLElement`.** It's a base class that extends
  `HTMLElement` — the exact same foundation your own Web Components sit on. Nothing
  about custom elements, `connectedCallback`, or the constructor restrictions you
  already hit stops applying; Lit adds reactivity and templating on top, it doesn't
  replace the platform underneath.
- **`@property()` is a real, legal decorator use** — worth noticing given the
  free-function decorator limitation from Phase 2.75/2.75-adjacent work: TS/JS
  decorators can't wrap a plain function (`observed`'s `@observable_function` has no
  direct equivalent), but they *can* decorate class members, which is exactly what
  `@property()` is. Declaring a property this way makes Lit automatically schedule a
  re-render whenever it's assigned — the same "setter fused with re-render trigger"
  idea as `useState`, just spelled as a property assignment instead of a hook call.
- **`render()` + the `html` tagged template — no compiler required.** Components
  define `render()` returning a template built with the `html` tagged template
  literal. Unlike JSX, this needs **no build-time transform at all** — tagged
  template literals are standard JavaScript syntax already; `html` is just an
  ordinary function receiving the literal's pieces. A bundler can still optimize it,
  but nothing has to compile your source for a browser to run it as-is.
- **How Lit updates the DOM without a virtual DOM.** Each `html` template is parsed
  once, and Lit identifies exactly which parts are dynamic (the `${...}` slots) at
  that point. On a re-render, there's no diffing two full trees the way React
  does — Lit directly checks each known dynamic slot against its previous value and
  patches only the ones that changed. This is architecturally much closer to the
  surgical, targeted updates you hand-built for add/delete/reorder in
  `view_calls_model` than to React's general tree-diffing reconciliation.
- **Shadow DOM by default.** Unlike your own light-DOM `TodoItemElement`, Lit
  components use Shadow DOM out of the box — the real style/DOM encapsulation
  flagged as an optional stretch goal back in Phase 2.75 and never actually built.

### Steps

1. Scaffold: `npm create vite@latest` with the `lit-ts` template, or just
   `npm install lit` into a plain Vite+TS project — Lit doesn't need special
   scaffolding the way React's JSX pipeline does.
2. Rebuild `TodoItemElement` as a `LitElement` subclass: `@property()` for `text`
   and `checked`, a `render()` returning an `html` template for the checkbox, text,
   and delete button.
3. Rebuild `TodoListElement` similarly: a property holding the todos array,
   `render()` mapping over it to produce one `<todo-item>` per entry directly in the
   template — compare this map-and-return shape to the JSX version from Phase 3 and
   to your own hand-written `addTodoItem`/loop.
4. Wire up add/delete/toggle: you can keep the same `CustomEvent`-based
   communication you already know (Lit doesn't replace this — it's still just
   Custom Elements underneath), or use Lit's own template event-binding shorthand
   (`@click=${...}`). Worth trying both and comparing.
5. Drag-and-drop reorder: the same native HTML5 drag events as every other variant.
   Nothing about Lit changes this part at all.

### Checkpoints

- Compare a `@property()` declaration against your own hand-written getter/setter
  pair in `TodoItemElement`. What did Lit save you from writing by hand, and what's
  actually happening differently underneath versus just "fewer lines"?
- You now have two different explanations for "how does re-rendering avoid
  rebuilding everything": React's virtual DOM diff, and Lit's pre-identified dynamic
  template slots. Given what you know about how each is built, why can Lit skip a
  full diffing pass that React can't?
- Since Lit uses Shadow DOM by default, try the same `.closest("todo-item")`-style
  DOM traversal from `view_calls_model` inside a Lit component. Does it behave the
  same across the shadow boundary, or differently?

### Stretch (optional)

- Lit supports turning off Shadow DOM for a component — try it for one, and compare
  styling/encapsulation behavior against your light-DOM `TodoItemElement`.
- Look at `@state()` versus `@property()` — what's the actual difference, and which
  would you use for the todos array itself versus something meant to be configured
  from outside the component?

---

## Phase 5 — SolidJS (planned)

Not yet fleshed out — to be built out with the same structure once Phase 4 is
underway. Expect the interesting contrast to be fine-grained reactivity with no
virtual DOM *and* no re-running the whole component function on every update
(unlike both React and, to a lesser extent, Lit) — closer in spirit to your own
`Proxy`-based reactivity from Phase 2.5 than either of the other two frameworks.
