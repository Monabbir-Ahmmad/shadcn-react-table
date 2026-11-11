---
"@monabbir/shadcn-react-table": minor
---

**Changed:** The whole table — top toolbar, table and pagination/bottom toolbar — now sits inside your app's own shadcn `Card`, so its corners, border, shadow and background match the rest of your app. The toolbars are padded inside the card with a line between them and the table, and the selection banner is a full-width strip. In full screen the card fills the screen edge to edge, and the table scrolls between the toolbars. `card` is now a registry dependency (`shadcn add` installs it in your style if you don't have it). To drop the frame, pass `slotProps.root: { className: "rounded-none bg-transparent shadow-none ring-0" }`.
