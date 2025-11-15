# JSON ➜ TOON Converter

A Next.js 15 app that converts JSON to TOON format in real-time.

## Features

- Real-time JSON to TOON conversion
- Two-column responsive layout
- Copy to clipboard functionality
- Error handling for invalid JSON
- Smooth animations
- TailwindCSS styling

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Example

**Input JSON:**
```json
{
  "reviews": [
    {
      "id": 101,
      "customer": "Alex Rivera",
      "rating": 5,
      "comment": "Excellent!",
      "verified": true
    }
  ]
}
```

**Output TOON:**
```
reviews[1]{
  id, customer, rating, comment, verified;
  101, Alex Rivera, 5, Excellent!, true
}
```

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page component
│   └── globals.css     # Global styles
├── components/
│   ├── JsonEditor.tsx  # JSON input textarea
│   └── ToonOutput.tsx  # TOON output display
└── lib/
    └── convertToToon.ts # Conversion logic
```

## Build

```bash
npm run build
npm start
```

