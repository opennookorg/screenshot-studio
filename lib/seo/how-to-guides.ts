import type { GuideLink, HowToGuide } from "@/lib/seo/guides";

const EDITOR_CTA: GuideLink = { href: "/editor", label: "Open the free editor" };

const FREE_EDITOR: GuideLink = {
  href: "/free-screenshot-editor",
  label: "Free online screenshot editor",
};
const BEAUTIFIER: GuideLink = {
  href: "/features/screenshot-beautifier",
  label: "Screenshot beautifier",
};
const AUTO_BEAUTIFY: GuideLink = {
  href: "/features/auto-beautify",
  label: "Auto beautify in one click",
};
const THREE_D: GuideLink = { href: "/features/3d-effects", label: "3D screenshot effects" };
const ANIMATION: GuideLink = {
  href: "/features/animation-maker",
  label: "Screenshot animation maker",
};
const BROWSER_MOCKUPS: GuideLink = {
  href: "/features/browser-mockups",
  label: "Browser mockups",
};
const SOCIAL: GuideLink = {
  href: "/features/social-media-graphics",
  label: "Social media graphics",
};
const MOCKUPS: GuideLink = { href: "/mockup-generator", label: "Device mockup generator" };
const STORE: GuideLink = {
  href: "/store-screenshots",
  label: "App Store screenshot generator",
};
const TWEET: GuideLink = { href: "/tweet", label: "Tweet to image" };
const CROP: GuideLink = { href: "/crop-image", label: "Crop image" };
const RESIZE: GuideLink = { href: "/resize-image", label: "Resize image" };
const COMPRESS: GuideLink = { href: "/compress-image", label: "Compress image" };

const EXPORT_STEP = {
  title: "Export or copy the result",
  body: "Open Save in the top bar, pick PNG, JPEG, or WebP, choose 1x, 2x, or 3x resolution, and download. Copy puts a 2x PNG on your clipboard so you can paste it straight into Slack, Docs, or an email.",
};

const UPLOAD_STEP = {
  title: "Open the editor and add your screenshot",
  body: "Go to screenshot-studio.com/editor and paste with Cmd+V (Ctrl+V on Windows), drag the file onto the page, or click to browse. PNG, JPG, and WebP files up to 100MB work, and there is no account to create.",
};

const NO_WATERMARK_FAQ = {
  q: "Will my screenshot have a watermark?",
  a: "No. Every export from Screenshot Studio is clean, at every resolution, with no account and no paid plan.",
};

const PRIVACY_FAQ = {
  q: "Is my screenshot uploaded anywhere?",
  a: "No. The editor runs in your browser, and drafts are saved in your browser's own storage, so the image never leaves your device unless you share the export yourself.",
};

export const howToGuides: HowToGuide[] = [
  {
    kind: "how-to",
    topic: "markup",
    slug: "how-to-edit-screenshot-online",
    title: "How to Edit a Screenshot Online for Free (2026)",
    metaDescription:
      "Edit a screenshot online for free: add text, arrows, and blur, change the background, frame it in a browser or phone, and export PNG with no watermark or signup.",
    keywords: [
      "screenshot editor",
      "screenshot editor online",
      "screenshot editor online free",
      "edit screenshot online",
      "ss editor",
      "screen shot editing",
      "screenshot editor without watermark",
    ],
    answer:
      "To edit a screenshot online, paste it into a browser editor such as Screenshot Studio, use the Design tab to add text, arrows, shapes, or blur, pick a background from the BG tab, and export a PNG, JPEG, or WebP. It is free, needs no signup, and adds no watermark.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Mark it up",
        body: "In the Design tab, open Draw & Markup to add arrows, curves, lines, rectangles, circles, or blur. Open Add Text for captions and labels in any of 32 fonts.",
      },
      {
        title: "Give it a background",
        body: "Switch to the BG tab and pick a gradient, mesh, wallpaper image, or solid color. Choose Transparent under Custom Background if you want only the screenshot.",
      },
      {
        title: "Frame and style it",
        body: "Use Style, Border, and Shadow for rounded corners and depth, or switch the top toggle from Image to Browser or Device to wrap the shot in a Safari, Chrome, iPhone, or MacBook frame.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "What you can change in a screenshot editor",
        paragraphs: [
          "A screenshot editor is built for one job: making a capture clear enough to share. That usually means pointing at something, hiding something, and making the whole image look intentional instead of cropped out of a busy desktop.",
          "Screenshot Studio covers all three in one page. It works on the screenshot you already have, so there is nothing to install and nothing to capture again.",
        ],
        bullets: [
          "Point: arrows, curved arrows, lines, rectangles, and circles in 12 preset colors or any custom color, with stroke widths from 1 to 24px.",
          "Explain: text layers with 32 fonts, weights from Thin to Black, sizes up to 150px, and an optional drop shadow.",
          "Hide: blur or mosaic any region, with a strength slider for each one.",
          "Present: gradients, wallpapers, shadows, rounded corners, browser frames, device mockups, and 3D tilt.",
        ],
      },
      {
        heading: "Pick the right export format",
        paragraphs: [
          "PNG keeps text and UI edges perfectly sharp and is the safe default for documentation and bug reports. JPEG is the editor's default because it makes much smaller files for social posts and slides. WebP is smaller again and works well on websites.",
          "Resolution matters more than format for sharpness. Export at 2x for most uses, and 3x when the image will be shown large or printed.",
        ],
      },
      {
        heading: "Your work is saved as you go",
        paragraphs: [
          "The editor saves a draft in your browser about a second after each change, so a closed tab does not lose your edits. Cmd+Z and Cmd+Shift+Z (Ctrl+Z and Ctrl+Y on Windows) undo and redo, and Start over resets the design while keeping your uploaded images.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best free screenshot editor online?",
        a: "For most people, a browser editor is enough. Screenshot Studio is free and open source, runs in any modern browser, and covers text, arrows, blur, backgrounds, frames, 3D, and video export without a watermark. If you only need to crop, the editor built into your operating system is fine.",
      },
      NO_WATERMARK_FAQ,
      {
        q: "Can I edit screenshots on my phone?",
        a: "Screenshot Studio is designed for a laptop or desktop browser, where there is room for the canvas and the panels. On a phone, your built-in photo editor is quicker for simple crops and markup.",
      },
      PRIVACY_FAQ,
    ],
    related: [FREE_EDITOR, BEAUTIFIER, BROWSER_MOCKUPS, CROP],
  },
  {
    kind: "how-to",
    topic: "markup",
    slug: "how-to-add-text-to-screenshot",
    title: "How to Add Text to a Screenshot Online (Free)",
    metaDescription:
      "Add captions, labels, and titles to a screenshot online for free. Choose from 32 fonts, set size, color, and shadow, place the text anywhere, and export with no watermark.",
    keywords: [
      "add text to screenshot",
      "screenshot text editor online",
      "add caption to screenshot",
      "write on screenshot online",
      "put text on screenshot",
    ],
    answer:
      "Open the screenshot in Screenshot Studio, go to the Add Text section in the Design tab, type your caption, then set the font, weight, size, color, and position. Add a shadow if the text sits on a busy area, and export as PNG. It is free and adds no watermark.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Add a text layer",
        body: "In the Design tab, open Add Text and type your caption. Each text layer is separate, so you can add a title, a label, and a footnote and style them differently.",
      },
      {
        title: "Style the text",
        body: "Pick one of 32 fonts, a weight from Thin to Black, and a size from 8 to 150px. Choose a quick color or any custom color, and lower the opacity for subtle labels.",
      },
      {
        title: "Place it",
        body: "Drag the text on the canvas or use Position on canvas to center it or set exact X and Y percentages. Switch Orientation to vertical for side labels.",
      },
      {
        title: "Make it readable",
        body: "Turn on Shadow and raise the blur a little when text sits on top of a busy screenshot. A soft dark shadow behind white text works on almost any background.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "Tips for text people actually read",
        paragraphs: [
          "Text on a screenshot competes with everything else in the image, so keep it short and give it room. A few words usually do more than a full sentence.",
        ],
        bullets: [
          "Use one font and at most two weights. A bold headline over a regular caption is plenty.",
          "Put titles on the background around the screenshot, not on top of the UI, by adding padding in the Style section first.",
          "Match the text color to one color already in the screenshot so it looks designed, not pasted on.",
          "Check the result at the size people will see it. Social feeds on a phone are much smaller than your editor canvas.",
        ],
      },
      {
        heading: "Adding text vs changing text",
        paragraphs: [
          "Screenshot Studio adds new text layers on top of your image. It does not detect or rewrite text that is already inside the screenshot. That keeps captures honest: labels and captions explain what is on screen without changing what the screen showed.",
          "If you need to hide something in the original, such as a name or an email address, use the blur tool instead.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I add text to a screenshot for free?",
        a: "Paste the screenshot into screenshot-studio.com/editor, open Add Text in the Design tab, type your text, style it, and export. There is no signup and no watermark.",
      },
      {
        q: "Which fonts can I use?",
        a: "There are 32 fonts built in, covering clean sans serifs, serifs, monospace, and display styles, each with a weight picker from Thin to Black.",
      },
      {
        q: "Can I edit the original text inside a screenshot?",
        a: "No. Screenshot Studio adds text on top of your image and does not change the text that was captured. To hide existing text, blur or mosaic that area instead.",
      },
      NO_WATERMARK_FAQ,
    ],
    related: [FREE_EDITOR, SOCIAL, BEAUTIFIER],
  },
  {
    kind: "how-to",
    topic: "markup",
    slug: "how-to-blur-screenshot",
    title: "How to Blur Part of a Screenshot Online (Free)",
    metaDescription:
      "Blur or pixelate names, emails, and private details in a screenshot online for free. Switch each region between blur and mosaic, set the strength, and export in seconds.",
    keywords: [
      "blur screenshot",
      "blur part of screenshot",
      "pixelate screenshot online",
      "hide sensitive info in screenshot",
      "blur image online free",
      "mosaic screenshot",
    ],
    answer:
      "Open the screenshot in Screenshot Studio, choose Blur in the Draw & Markup section of the Design tab, and drag a box over each area you want to hide. Switch any region between Blur and Mosaic and raise the amount until the text cannot be read, then export.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Pick the blur tool",
        body: "In the Design tab, open Draw & Markup and select Blur. The tool stays selected, so you can hide several areas in a row.",
      },
      {
        title: "Drag over the private details",
        body: "Draw a box over each name, email address, token, or face. Every region is listed as #1, #2, and so on, so you can find it again later.",
      },
      {
        title: "Choose Blur or Mosaic and set the strength",
        body: "Each region has its own Blur or Mosaic toggle and an amount slider from 2 to 30px. Mosaic gives the classic pixelated look, and a higher amount hides more.",
      },
      {
        title: "Zoom in and check",
        body: "Look closely at every region before you export. If you can still guess a word, make the box a little bigger or raise the amount.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "What to hide before you share a screenshot",
        paragraphs: [
          "Screenshots leak more than people expect. Before you post a bug report, a support ticket, or a tweet, scan the whole image, not just the part you care about.",
        ],
        bullets: [
          "Names, email addresses, phone numbers, and profile photos of other people.",
          "API keys, tokens, passwords, and session IDs in dev tools or terminal output.",
          "Order numbers, account numbers, addresses, and the last digits of cards.",
          "Browser tabs, bookmarks, and notifications around the edges of the capture.",
        ],
      },
      {
        heading: "Blur, mosaic, or a solid box?",
        paragraphs: [
          "Blur looks the softest and suits product shots where the hidden area is decoration. Mosaic is the most recognisable way to say that something was deliberately hidden. For anything truly secret, such as a live API key, the safest option is to rotate the secret after sharing, because no visual effect is as strong as a revoked credential.",
          "Use a generous amount on short text. A single word blurred lightly can sometimes be guessed from its shape, so push the slider higher than you think you need.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I blur part of a screenshot for free?",
        a: "Open the image in screenshot-studio.com/editor, pick Blur under Draw & Markup, drag over the area, and export. There is no signup and no watermark.",
      },
      {
        q: "Can I pixelate instead of blur?",
        a: "Yes. Every blur region has a Mosaic option that pixelates the area instead of softening it, and you can mix both styles in one image.",
      },
      {
        q: "Can blurred text be recovered?",
        a: "A strong blur or mosaic on the exported image cannot simply be undone, but very light blur on short words can sometimes be guessed. Use a high amount and cover the full area. For secrets such as API keys, rotate them anyway.",
      },
      PRIVACY_FAQ,
    ],
    related: [FREE_EDITOR, CROP, BEAUTIFIER],
  },
  {
    kind: "how-to",
    topic: "markup",
    slug: "how-to-annotate-screenshot",
    title: "How to Annotate a Screenshot Online (Arrows, Shapes, Text)",
    metaDescription:
      "Annotate screenshots online for free with arrows, curved arrows, lines, boxes, circles, text, and blur. Pick colors and stroke widths, then export with no watermark.",
    keywords: [
      "annotate screenshot",
      "annotate screenshot online",
      "add arrow to screenshot",
      "draw on screenshot online",
      "screenshot markup tool",
      "highlight screenshot",
    ],
    answer:
      "Paste the screenshot into Screenshot Studio, open Draw & Markup in the Design tab, and use Arrow, Curve, Line, Rect, or Circle to point at what matters. Pick a color and stroke width, add a short label with Add Text, blur anything private, and export.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Choose a markup tool",
        body: "Open Draw & Markup in the Design tab. Arrow and Curve point at things, Line underlines them, and Rect and Circle outline an area.",
      },
      {
        title: "Set color and stroke",
        body: "Pick one of 12 preset colors or any custom color, and set the stroke from 1 to 24px. Thicker strokes read better once the image is scaled down in a chat or a doc.",
      },
      {
        title: "Draw on the canvas",
        body: "Drag to draw each shape. Undo with Cmd+Z or Ctrl+Z, delete a selected shape with Delete or Backspace, or use Clear all to start again.",
      },
      {
        title: "Label and redact",
        body: "Add a few words with Add Text next to each arrow, and blur any private details with the Blur tool in the same section.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "Annotation that makes the point fast",
        paragraphs: [
          "Good annotation answers one question: where should I look? Every extra arrow makes the answer slower, so start with one mark and only add more if the first one is not enough.",
        ],
        bullets: [
          "Use one color for everything you want people to notice. Red or orange stands out on most interfaces.",
          "Circle or box the target, and use an arrow only when the target is small or far from your label.",
          "Keep labels to two to five words and put them in empty space, not over the UI.",
          "Blur private data before you add arrows, so nothing sensitive slips through at the end.",
        ],
      },
      {
        heading: "Where annotated screenshots work best",
        paragraphs: [
          "Bug reports and support replies get resolved faster when the screenshot shows the exact button or error. Documentation and onboarding guides need the same clarity at every step. Release notes and social posts benefit from a light touch: one arrow plus a clean background from the BG tab looks far more polished than a raw capture.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I add an arrow to a screenshot?",
        a: "Open the screenshot in screenshot-studio.com/editor, choose Arrow or Curve under Draw & Markup in the Design tab, and drag from where the arrow should start to where it should point.",
      },
      {
        q: "Can I highlight part of a screenshot?",
        a: "Yes. Draw a rectangle or circle around the area in a bright color. For a numbered sequence, add small text labels such as 1, 2, and 3 next to each shape.",
      },
      {
        q: "Why can't I see the markup tools?",
        a: "Draw & Markup is hidden while Device mode is active. Switch the toggle at the top of the Design tab back to Image or Browser to annotate.",
      },
      NO_WATERMARK_FAQ,
    ],
    related: [FREE_EDITOR, BEAUTIFIER, BROWSER_MOCKUPS],
  },
  {
    kind: "how-to",
    topic: "present",
    slug: "how-to-beautify-screenshots",
    title: "How to Make Screenshots Look Professional (Free Beautifier)",
    metaDescription:
      "Turn plain screenshots into polished images: add a gradient background, padding, rounded corners, and a soft shadow, and choose a frame style. Free, no watermark.",
    keywords: [
      "screenshot beautifier",
      "make screenshots look professional",
      "beautiful screenshots",
      "screenshot background",
      "screenshot art",
      "pretty screenshot",
      "beautify screenshot automatically",
    ],
    answer:
      "To make a screenshot look professional, give it breathing room and depth: place it on a gradient or wallpaper background, add padding, round the corners, and add a soft shadow. Use the Design and Background controls in Screenshot Studio to build your look.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Start with Beautify (optional)",
        body: "Click Beautify next to Animate under the canvas. It builds a background, padding, corners, and shadow from your screenshot's own colours; click again for the next of six looks, or press Cmd+Z to undo. Then fine-tune with the steps below.",
      },
      {
        title: "Pick a background",
        body: "In the BG tab, try Magic Gradients and press Shuffle until one fits, or pick a mesh, classic gradient, wallpaper, or solid color. Background Effects add grain or a subtle grid, dot, or line pattern.",
      },
      {
        title: "Round the corners and add a shadow",
        body: "In the Design tab, set Border to Curved or Round and adjust the radius, then choose a Soft or Strong shadow so the screenshot lifts off the background.",
      },
      {
        title: "Choose a frame style",
        body: "Style offers Glass Light, Glass Dark, Outline, and Border treatments. Adjust the border and shadow to finish your design.",
      },
      {
        title: "Match the canvas to where it will be posted",
        body: "Use the size picker in the top bar for Instagram, X, LinkedIn, YouTube, Pinterest, and more, or type a custom width and height.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "Why beautified screenshots perform better",
        paragraphs: [
          "A raw screenshot looks like a work in progress. The same image on a calm background with even padding looks like something a team chose to show. That difference matters on landing pages, launch posts, and pitch decks, where people decide in a second whether to keep reading.",
        ],
      },
      {
        heading: "A simple recipe that always works",
        paragraphs: [
          "When in doubt, use this combination and adjust from there.",
        ],
        bullets: [
          "A soft two-color gradient pulled from your product's brand colors.",
          "Enough padding that the background shows on every side.",
          "A curved border radius so the corners match modern UI.",
          "A soft shadow, not a strong one, so the image lifts without looking heavy.",
          "Grain at a low percentage to stop large gradients from banding.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a screenshot beautifier?",
        a: "A screenshot beautifier wraps a plain capture in a background, padding, rounded corners, and a shadow so it looks ready to publish. Screenshot Studio does this for free in the browser, and adds browser frames, device mockups, 3D, and animation.",
      },
      {
        q: "Can a screenshot be beautified automatically?",
        a: "Yes. Beautify reads your screenshot's colours in the browser and applies one of six matching looks, checked so the image stands out from the background. Each click moves to the next look, and each one is a single undo step.",
      },
      {
        q: "How many backgrounds are there?",
        a: "Magic Gradients alone has 100 options, plus 110 classic gradients, 12 mesh gradients, wallpaper collections, solid colors, and your own image or a transparent background.",
      },
      {
        q: "Can I use my brand colors?",
        a: "Yes. The Gradients section has custom From and To colors, and Custom Background accepts any solid color or your own image.",
      },
      NO_WATERMARK_FAQ,
    ],
    related: [AUTO_BEAUTIFY, BEAUTIFIER, SOCIAL, BROWSER_MOCKUPS],
  },
  {
    kind: "how-to",
    topic: "present",
    slug: "how-to-animate-screenshots",
    title: "How to Animate a Screenshot and Export a Video (Free)",
    metaDescription:
      "Animate a screenshot into a short product video for free: pick a preset like Slide In 3D or Ken Burns, set the timeline length, and export MP4 or WebM at 60fps.",
    keywords: [
      "screenshot animation",
      "animate screenshot",
      "screenshot to video",
      "animated product mockup",
      "screenshot video maker",
    ],
    answer:
      "Open your screenshot in Screenshot Studio, click Animate under the canvas or open the Motion tab, and pick a preset such as Hero Landing, Slide In 3D, or Ken Burns Zoom In. Adjust the timeline length, then use Export Video to save an MP4 or WebM rendered at 60fps.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Style the still image first",
        body: "Set the background, shadow, frame, and any 3D tilt before animating. The animation moves the finished design, so a polished still makes a polished video.",
      },
      {
        title: "Pick an animation preset",
        body: "Open the Motion tab on the right. Presets are grouped into Reveal, Slide, Fade, Flip, Perspective, Orbit, Depth, Ken Burns, Bounce, and Effects.",
      },
      {
        title: "Set the timing",
        body: "Click Animate under the canvas to open the timeline. Play, loop, and set the total Duration anywhere from 1 to 30 seconds.",
      },
      {
        title: "Export the video",
        body: "Choose Export Video, pick Animation, then MP4 (H.264) for the widest support or WebM (VP8) for the web. High quality exports at 25 Mbps.",
      },
    ],
    sections: [
      {
        heading: "Which preset to use",
        paragraphs: [
          "Match the motion to where the video will play. Subtle motion suits landing pages that loop forever, while bolder moves grab attention in a social feed.",
        ],
        bullets: [
          "Landing page hero: Hero Landing, Rise & Settle, or Hover Float.",
          "Launch post or ad: Slide In 3D, Dramatic Zoom, or Spring Pop.",
          "Product tour feel: Apple Showcase, Showcase Tilt, or Turntable.",
          "Background loop behind text: Ken Burns Zoom In or Pan Left.",
        ],
      },
      {
        heading: "Slideshows from several screenshots",
        paragraphs: [
          "Add Slide in the top bar creates more slides in the same project. In Export Video, choose Slideshow instead of Animation and set how long each slide stays on screen, from half a second to 30 seconds, to turn a set of screenshots into one video.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I turn a screenshot into a video for free?",
        a: "Yes. Screenshot Studio exports MP4 and WebM videos for free, with no watermark and no account.",
      },
      {
        q: "How long can the animation be?",
        a: "The timeline runs from 1 to 30 seconds. Each preset has its own natural length, and you can stretch the timeline to hold the final frame.",
      },
      {
        q: "Which format should I choose?",
        a: "MP4 (H.264) plays almost everywhere, including X, LinkedIn, Slack, and Keynote. WebM (VP8) is smaller and suits websites.",
      },
      {
        q: "Can I combine 3D tilt with animation?",
        a: "Yes. Set a 3D angle in the 3D tab first, and presets in the Perspective, Orbit, and Depth groups add 3D motion on top.",
      },
    ],
    related: [ANIMATION, THREE_D, MOCKUPS],
  },
  {
    kind: "how-to",
    topic: "present",
    slug: "how-to-make-3d-screenshot",
    title: "How to Make a 3D Screenshot Mockup Online (Free)",
    metaDescription:
      "Tilt a flat screenshot into a 3D perspective mockup for free. Use isometric and hero presets or fine-tune rotation and depth, then export PNG or animate it.",
    keywords: [
      "3d screenshot",
      "3d screenshot mockup",
      "tilt screenshot",
      "isometric screenshot",
      "perspective mockup online",
    ],
    answer:
      "Upload your screenshot to Screenshot Studio, open the 3D tab on the right, and pick a Layout Preset such as SaaS Hero or Isometric. Fine-tune with Rotate X, Rotate Y, Rotate Z, Depth, and Scale, add a background and shadow, and export a PNG or turn it into a video.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Open the 3D tab",
        body: "The 3D tab sits in the right panel. Switch between Zoom and Tilt, and drag the small preview to tilt the screenshot by hand.",
      },
      {
        title: "Start from a preset",
        body: "Layout Presets are grouped into Popular, Basic, Dramatic, Perspective, Zoom, Half Section, and Float. Perspective includes isometric left, right, and top views.",
      },
      {
        title: "Fine-tune the angle",
        body: "Under Fine Tune, adjust Rotate X and Rotate Y up to 60 degrees each way, Rotate Z up to 45 degrees, Depth from 500 to 3000px, and Scale.",
      },
      {
        title: "Add depth with light and shadow",
        body: "A Soft or Strong shadow in the Design tab and a Light & Shadow overlay in the BG tab make the tilt feel physical.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "When a 3D screenshot helps",
        paragraphs: [
          "A tilted screenshot reads as a product, not a page. It works well for landing page heroes, launch announcements, and feature cards where the image supports a headline instead of being read closely.",
          "For documentation and bug reports, stay flat. Perspective shrinks the far side of the image and makes small text harder to read.",
        ],
      },
      {
        heading: "Getting the angle right",
        paragraphs: [
          "Small angles look more premium than big ones. Start with a preset, then pull Rotate X and Rotate Y back until the tilt is noticeable but the main content is still easy to read.",
        ],
        bullets: [
          "Tilt so the most important part of the UI faces the viewer.",
          "Leave room on the side the screenshot turns away from, so it does not look cropped.",
          "Use Half Section presets when the image sits next to text and should bleed off one edge.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I make a screenshot 3D for free?",
        a: "Open it in screenshot-studio.com/editor, choose a preset in the 3D tab, adjust the rotation, and export. There is no signup and no watermark.",
      },
      {
        q: "Can I make an isometric screenshot?",
        a: "Yes. The Perspective group in Layout Presets includes isometric left, right, and top views.",
      },
      {
        q: "Can I animate the 3D mockup?",
        a: "Yes. After setting the angle, open the Motion tab and use a Perspective, Orbit, or Depth preset, then export MP4 or WebM.",
      },
      NO_WATERMARK_FAQ,
    ],
    related: [THREE_D, ANIMATION, MOCKUPS],
  },
  {
    kind: "how-to",
    topic: "present",
    slug: "how-to-put-screenshot-in-iphone-mockup",
    title: "How to Put a Screenshot in an iPhone or MacBook Mockup",
    metaDescription:
      "Place a screenshot inside an iPhone, MacBook, or Apple Watch frame online for free. Choose single or multi-device layouts and export a clean PNG with no watermark.",
    keywords: [
      "iphone mockup",
      "put screenshot in iphone frame",
      "macbook mockup online",
      "device mockup generator",
      "screenshot in phone frame",
    ],
    answer:
      "Upload your screenshot to Screenshot Studio, switch the toggle at the top of the Design tab to Device, and pick a Phone, Watch, or Laptop frame such as iPhone 17 Pro or MacBook Pro. Choose a layout, add a background, and export. It is free with no watermark.",
    cta: { href: "/mockup-generator", label: "Open the mockup generator" },
    steps: [
      UPLOAD_STEP,
      {
        title: "Switch to Device mode",
        body: "At the top of the Design tab, change the toggle from Image to Device. The panel shows Phone, Watch, and Laptop tabs.",
      },
      {
        title: "Choose a device",
        body: "Phones include iPhone 17 Pro, iPhone 17, iPhone 15, iPhone 14 Pro, and iPhone 13. Laptops include MacBook Pro and MacBook Air models, and there are several Apple Watch frames.",
      },
      {
        title: "Pick a layout",
        body: "Center Stage shows one device. Editorial Offset, Duo Split, Duo Depth, Trio Fan, and Product Suite arrange several devices for launch images.",
      },
      {
        title: "Finish the scene",
        body: "Pick a background in the BG tab, and use the 3D tab to tilt the whole scene if you want more depth.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "Use a screenshot that fits the device",
        paragraphs: [
          "A phone mockup looks right when the screenshot was taken on a phone, or at least at a tall portrait ratio. Dropping a wide desktop capture into an iPhone frame squeezes the UI. For desktop captures, use a MacBook frame or Browser mode instead.",
        ],
      },
      {
        heading: "Where device mockups fit",
        paragraphs: [
          "Device frames tell people what platform they are looking at before they read a word. They work well for app landing pages, Product Hunt galleries, investor decks, and social launch posts.",
        ],
        bullets: [
          "App Store listings have strict pixel sizes, so use the App Store screenshot generator for those.",
          "For Android phones or iPads, check our mockup generator roundup for tools that cover them.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is the iPhone mockup free?",
        a: "Yes. Every device frame and layout in Screenshot Studio is free, with no account and no watermark.",
      },
      {
        q: "Are there Android or iPad frames?",
        a: "Not yet. Screenshot Studio covers iPhone, MacBook, and Apple Watch. Our best free mockup generators guide lists tools with Android and iPad frames.",
      },
      {
        q: "Can I show more than one device?",
        a: "Yes. Duo Split, Duo Depth, Trio Fan, and Product Suite layouts place several devices in one image.",
      },
      {
        q: "Why are the markup tools hidden in Device mode?",
        a: "Draw & Markup is turned off in Device mode. Annotate the screenshot in Image mode first, export it, then place that export in a device frame.",
      },
    ],
    related: [MOCKUPS, THREE_D, STORE],
  },
  {
    kind: "how-to",
    topic: "present",
    slug: "how-to-add-browser-frame-to-screenshot",
    title: "How to Add a Browser Window Frame to a Screenshot",
    metaDescription:
      "Wrap a website screenshot in a Safari or Chrome browser window, in light or dark, with your own URL in the address bar. Free online, no signup, no watermark.",
    keywords: [
      "browser mockup",
      "add browser frame to screenshot",
      "safari mockup",
      "chrome window mockup",
      "website screenshot mockup",
    ],
    answer:
      "Upload your website screenshot to Screenshot Studio, switch the toggle at the top of the Design tab to Browser, and pick Safari, Safari Dark, Chrome, or Chrome Dark. Type your URL into the address bar field, adjust the header size, add a background, and export.",
    cta: EDITOR_CTA,
    steps: [
      {
        title: "Add a screenshot or capture a URL",
        body: "Paste, drop, or browse for a screenshot in the editor. You can also type a website address into Enter website URL on the empty canvas to capture the page at 1920x1080 in light or dark mode.",
      },
      {
        title: "Switch to Browser mode",
        body: "At the top of the Design tab, change the toggle from Image to Browser.",
      },
      {
        title: "Choose the window style",
        body: "Pick Safari or Safari Dark for a macOS window, or Chrome or Chrome Dark for a Windows-style window.",
      },
      {
        title: "Set the URL and header size",
        body: "Type the address you want shown in the URL field, and scale the header from 50 to 200% so it matches the size of your screenshot.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "Why a browser frame helps",
        paragraphs: [
          "A bare website capture has no context: it could be a design file, an app, or a random image. A browser frame says this is a live website, and the URL in the address bar tells people where to find it. That is why browser frames are common on landing pages, portfolios, case studies, and changelogs.",
        ],
      },
      {
        heading: "Get a clean capture",
        paragraphs: [
          "Frames look best around a capture of just the page content, without your own browser's tabs and toolbar. Hide cookie banners and chat widgets first, or use the URL capture on the empty canvas to grab a clean 1920x1080 view.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which browser frames are available?",
        a: "Safari and Chrome, each in light and dark. Safari uses a macOS-style window and Chrome uses a Windows-style window.",
      },
      {
        q: "Can I change the URL in the address bar?",
        a: "Yes. Type any address into the URL field in Browser mode and it appears in the frame.",
      },
      {
        q: "Can I annotate a screenshot inside a browser frame?",
        a: "Yes. Draw & Markup and Add Text work in Browser mode, so you can add arrows and labels on top of the framed screenshot.",
      },
      NO_WATERMARK_FAQ,
    ],
    related: [BROWSER_MOCKUPS, BEAUTIFIER, FREE_EDITOR],
  },
  {
    kind: "how-to",
    topic: "publish",
    slug: "instagram-screenshot-size",
    title: "How to Post Screenshots on Instagram Without Cropping",
    metaDescription:
      "The right sizes for screenshots on Instagram: 1080x1350 portrait, 1080x1080 square, and 1080x1920 for Stories and Reels. Resize and style screenshots for free.",
    keywords: [
      "instagram screenshot editor",
      "instagram screenshot size",
      "post screenshot on instagram without cropping",
      "screenshot for instagram story",
      "instagram post size",
    ],
    answer:
      "Instagram crops screenshots that do not match its ratios. Put the screenshot on a 1080x1350 (4:5) canvas for feed posts, 1080x1080 for square posts, or 1080x1920 (9:16) for Stories and Reels. Screenshot Studio has these as presets, adds a background around the screenshot so nothing is cut off, and exports with no watermark.",
    cta: EDITOR_CTA,
    steps: [
      UPLOAD_STEP,
      {
        title: "Pick an Instagram size",
        body: "Open the size picker in the top bar and choose Instagram Portrait (1080x1350), Square (1080x1080), Landscape (1080x566), Story, or Reel (both 1080x1920).",
      },
      {
        title: "Fit the screenshot with padding",
        body: "Add padding in the Style section so the whole screenshot sits inside the canvas with background showing around it. Nothing gets cropped.",
      },
      {
        title: "Add a background and a caption",
        body: "Pick a gradient in the BG tab and add a short headline with Add Text. Keep text away from the top and bottom of Story canvases, where Instagram shows its own buttons.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "Instagram sizes at a glance",
        paragraphs: [
          "These are the canvas presets built into Screenshot Studio. Export at 1x for the exact pixel size, or 2x for extra sharpness that Instagram will scale down.",
        ],
        bullets: [
          "Feed portrait: 1080x1350 (4:5). Takes up the most room in the feed, so it is usually the best choice.",
          "Feed square: 1080x1080 (1:1).",
          "Feed landscape: 1080x566 (1.91:1).",
          "Stories and Reels: 1080x1920 (9:16).",
        ],
      },
      {
        heading: "Making phone screenshots work in the feed",
        paragraphs: [
          "A phone screenshot is much taller than a 4:5 post, so Instagram either crops it or shrinks it. Placing it on a 1080x1350 canvas with a background keeps it whole, and the background gives you space for a headline. For carousels, use Add Slide to design several images in one project and Export All to download them together.",
        ],
      },
    ],
    faqs: [
      {
        q: "What size should a screenshot be for Instagram?",
        a: "Use 1080x1350 for feed posts, 1080x1080 for square posts, and 1080x1920 for Stories and Reels. Screenshot Studio has presets for each.",
      },
      {
        q: "How do I post a screenshot on Instagram without it getting cropped?",
        a: "Place the screenshot on a canvas that already matches Instagram's ratio, with padding around it, then upload that image. Instagram has nothing to crop.",
      },
      {
        q: "Can I make an Instagram carousel from screenshots?",
        a: "Yes. Add a slide for each image with Add Slide, design them at the same size, and use Export All to download them as a zip.",
      },
      NO_WATERMARK_FAQ,
    ],
    related: [SOCIAL, RESIZE, BEAUTIFIER],
  },
  {
    kind: "how-to",
    topic: "publish",
    slug: "app-store-screenshot-sizes",
    title: "App Store Screenshot Sizes and How to Make Them (2026)",
    metaDescription:
      "App Store screenshot sizes for iPhone and iPad, including 1320x2868 for 6.9-inch displays, and how to make framed, captioned store screenshots for free.",
    keywords: [
      "app store screenshot sizes",
      "app store screenshot generator",
      "iphone 6.9 screenshot size",
      "app store screenshots",
      "app screenshot maker",
    ],
    answer:
      "App Store Connect accepts 1320x2868 portrait screenshots for 6.9-inch iPhone displays, and Apple scales that set down for smaller iPhones. Screenshot Studio's App Store screenshot generator outputs exactly 1320x2868, with 1 to 10 slides and six templates. The main editor also has presets for 6.5-inch and 5.5-inch iPhones and 12.9-inch iPad Pro.",
    cta: { href: "/store-screenshots", label: "Make App Store screenshots" },
    steps: [
      {
        title: "Capture clean screens",
        body: "Take screenshots in the Simulator or on a device with realistic demo data, a full battery, and no personal notifications.",
      },
      {
        title: "Open the App Store screenshot generator",
        body: "Go to screenshot-studio.com/store-screenshots. Output is fixed at 1320x2868, the iPhone 6.9-inch size.",
      },
      {
        title: "Choose a template",
        body: "Pick Classic, Hero, Editorial, Offset, Duo, or Minimal, then add your screenshots and a short headline for each slide.",
      },
      {
        title: "Build the set",
        body: "Add up to 10 slides. Lead with the two or three screens that best explain what the app does, because they are all many people see in search results.",
      },
      {
        title: "Export and upload",
        body: "Download the slides and upload them to the 6.9-inch iPhone section in App Store Connect.",
      },
    ],
    sections: [
      {
        heading: "Screenshot sizes you can make here",
        paragraphs: [
          "Apple's exact requirements change as new iPhones ship, so check the Screenshot specifications page in App Store Connect Help before you submit. These are the sizes Screenshot Studio can produce today.",
        ],
        bullets: [
          "iPhone 6.9-inch: 1320x2868 (App Store screenshot generator).",
          "iPhone 6.5-inch: 1284x2778, or 2778x1284 landscape (editor size picker, App Store group).",
          "iPhone 5.5-inch: 1242x2208, or 2208x1242 landscape (editor).",
          "iPad Pro 12.9-inch: 2048x2732, or 2732x2048 landscape (editor).",
        ],
      },
      {
        heading: "Google Play",
        paragraphs: [
          "There is no Google Play preset yet. Google Play phone screenshots use a 16:9 or 9:16 ratio, so the 9:16 option in the editor's size picker (1080x1920) is a good fit. Check the Play Console help for current limits before uploading.",
        ],
      },
      {
        heading: "What converts on the App Store",
        paragraphs: [
          "Store screenshots are ads, not documentation. Each one should sell a single benefit in a few words, with the screen underneath as proof.",
        ],
        bullets: [
          "Write captions as benefits, such as Track every habit in one tap, not feature names.",
          "Keep captions large enough to read at thumbnail size in search results.",
          "Use the same template, fonts, and colors across the whole set.",
        ],
      },
    ],
    faqs: [
      {
        q: "What size are App Store screenshots?",
        a: "For 6.9-inch iPhones, App Store Connect accepts 1320x2868 portrait. Apple publishes the full list, including iPad sizes, on its Screenshot specifications page.",
      },
      {
        q: "How many App Store screenshots can I upload?",
        a: "Apple allows up to 10 per device size and language. The App Store screenshot generator supports 1 to 10 slides to match.",
      },
      {
        q: "Is the App Store screenshot generator free?",
        a: "Yes. It is free with no account and no watermark.",
      },
      {
        q: "Can I make Google Play screenshots too?",
        a: "Yes, using the main editor at 9:16 (1080x1920). There is no dedicated Google Play template yet.",
      },
    ],
    related: [STORE, MOCKUPS, RESIZE],
  },
  {
    kind: "how-to",
    topic: "publish",
    slug: "how-to-take-and-edit-screenshot",
    title: "How to Take a Screenshot and Edit It (Mac, Windows, Chromebook)",
    metaDescription:
      "Keyboard shortcuts to take a screenshot on Mac, Windows, and Chromebook, plus how to paste it straight into a free online editor to crop, annotate, blur, and style it.",
    keywords: [
      "how to take a screenshot and edit it",
      "screenshot and edit",
      "screenshot shortcut mac",
      "screenshot shortcut windows",
      "chromebook screenshot",
      "edit screenshot",
    ],
    answer:
      "Capture the screen straight to your clipboard (Shift+Cmd+Ctrl+4 on Mac, Windows+Shift+S on Windows, Ctrl+Shift+Show windows on Chromebook), then open screenshot-studio.com/editor and press Cmd+V or Ctrl+V. The screenshot opens ready to annotate, blur, style, and export, with no file to save first.",
    cta: EDITOR_CTA,
    steps: [
      {
        title: "Capture to the clipboard",
        body: "On Mac, press Shift+Cmd+Ctrl+4 and drag over an area. On Windows, press Windows+Shift+S and pick a snip mode. On a Chromebook, press Ctrl+Shift+Show windows and select an area.",
      },
      {
        title: "Open the editor",
        body: "Go to screenshot-studio.com/editor in any browser. Bookmark it so the next edit is one click away.",
      },
      {
        title: "Paste",
        body: "Press Cmd+V on Mac or Ctrl+V on Windows and ChromeOS. The screenshot appears on the canvas.",
      },
      {
        title: "Edit",
        body: "Add arrows, text, and blur in the Design tab, a background in the BG tab, or a browser or device frame.",
      },
      EXPORT_STEP,
    ],
    sections: [
      {
        heading: "Screenshot shortcuts on Mac",
        paragraphs: [
          "Add Ctrl to any of these shortcuts to copy the screenshot to the clipboard instead of saving a file to the desktop.",
        ],
        bullets: [
          "Shift+Cmd+3: the whole screen.",
          "Shift+Cmd+4: drag to select an area.",
          "Shift+Cmd+4, then Space: click a single window.",
          "Shift+Cmd+5: the Screenshot toolbar, with options for timers and screen recording.",
        ],
      },
      {
        heading: "Screenshot shortcuts on Windows",
        paragraphs: [],
        bullets: [
          "Windows+Shift+S: Snipping Tool, with rectangle, window, full screen, and freeform modes. The snip is copied to the clipboard.",
          "Windows+Print Screen: saves the whole screen to Pictures > Screenshots.",
          "Alt+Print Screen: copies only the active window.",
        ],
      },
      {
        heading: "Screenshot shortcuts on a Chromebook",
        paragraphs: [
          "Screenshots are saved to Downloads and also copied to the clipboard, so you can paste them into the editor right away.",
        ],
        bullets: [
          "Ctrl+Show windows: the whole screen.",
          "Ctrl+Shift+Show windows: select an area or a window.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I screenshot and edit at the same time?",
        a: "Capture to the clipboard with your system shortcut, then paste into screenshot-studio.com/editor. There is no need to save the file first.",
      },
      {
        q: "Can I paste a screenshot anywhere on the site?",
        a: "Yes. Pasting or dropping an image anywhere on Screenshot Studio opens it in the editor. If the editor already has an image, the new one is added as an extra layer.",
      },
      {
        q: "How do I crop a screenshot?",
        a: "Use the free crop image tool, or drag a tighter area when you take the screenshot. The main editor focuses on markup, backgrounds, and frames.",
      },
      PRIVACY_FAQ,
    ],
    related: [FREE_EDITOR, CROP, COMPRESS],
  },
  {
    kind: "how-to",
    topic: "publish",
    slug: "how-to-screenshot-a-tweet",
    title: "How to Screenshot a Tweet (X Post) Cleanly for Free",
    metaDescription:
      "Turn any X (Twitter) post into a clean image: paste the link, choose a light or dark card, add a background and padding, and download a sharp PNG. Free, no login.",
    keywords: [
      "tweet screenshot",
      "screenshot a tweet",
      "tweet to image",
      "x post screenshot",
      "twitter screenshot generator",
    ],
    answer:
      "Instead of cropping a screenshot of your feed, paste the post's link into Screenshot Studio's Tweet to image tool. It renders a clean card in light or dark, lets you add a background and padding, and downloads a sharp PNG. It is free and needs no X login.",
    cta: { href: "/tweet", label: "Open Tweet to image" },
    steps: [
      {
        title: "Copy the post link",
        body: "On X, open the post's share menu and choose Copy link, or copy the URL from your browser's address bar.",
      },
      {
        title: "Paste it into Tweet to image",
        body: "Go to screenshot-studio.com/tweet and paste the link. The post appears as a clean card with no feed, replies, or buttons around it.",
      },
      {
        title: "Style the card",
        body: "Choose a light or dark card, pick a background, and set the padding around it.",
      },
      {
        title: "Download",
        body: "Download the PNG, or use Share to send it through your device's share sheet.",
      },
    ],
    sections: [
      {
        heading: "Why not just take a screenshot?",
        paragraphs: [
          "A regular screenshot of X includes whatever is around the post: other tweets, trending topics, your own profile, and notification counts. It is also limited to your screen's resolution. Rendering the post as a card gives a sharp, consistent image that looks the same no matter who makes it.",
        ],
      },
      {
        heading: "Good uses for tweet images",
        paragraphs: [],
        bullets: [
          "Testimonials and social proof on a landing page.",
          "Quotes in newsletters, slides, and blog posts.",
          "Reposting on Instagram or LinkedIn, where X links do not preview well.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need to log in to X?",
        a: "No. Paste a link to a public post and the tool builds the image. There is no X login and no Screenshot Studio account.",
      },
      {
        q: "Can I make a dark mode tweet image?",
        a: "Yes. Switch the card to dark before downloading.",
      },
      {
        q: "Does it work with private accounts?",
        a: "No. Only public posts can be turned into images.",
      },
      NO_WATERMARK_FAQ,
    ],
    related: [TWEET, SOCIAL, BEAUTIFIER],
  },
];
