# Unthinkable — Social Media Content Analyzer

A small web app that extracts text from PDFs and images, analyzes the content, and provides engagement suggestions. The backend exposes an uploads API and optional LLM-powered analysis (via Groq). The frontend is a React app that provides a drag-and-drop upload UI and displays analysis results.

**Status:** Prototype — actively developed

**Tech stack:** Node.js, Express, MongoDB, React, Vite, Tesseract.js, pdf-parse, Groq (optional LLM)

**Contents**
- **`/server`**: Express API and services
- **`/client`**: React (Vite) frontend
- **`/uploads`**: temporary upload storage (created at runtime)

**Features**
- **Drag & Drop Upload**: Accepts PDF, PNG, JPG, JPEG files
- **Text Extraction**: Uses `pdf-parse` for PDFs and `tesseract.js` for images
- **Basic Heuristics**: Length, hashtags, CTA checks produce quick suggestions
- **Optional LLM Analysis**: When enabled, calls Groq LLM for expanded suggestions and rewriting
- **Persistence**: Saves analysis metadata to MongoDB

**Quick links**
- API: `GET /health`, `POST /api/analyze/upload`, `GET /api/analyze/recent`, `DELETE /api/analyze/clear`

**Prerequisites**
- Node.js (recommended v18+)
- npm (or pnpm/yarn)
- MongoDB (local or remote)
- Optional: Groq API key if you want AI-powered analysis

**Environment**
Create a `.env` file in the `server` folder with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/unthinkable
GROQ_API_KEY=your_groq_api_key_here    # optional — required only if you set useLLM=true
```

Replace `MONGO_URI` with your hosted MongoDB connection string if using Atlas or another provider.

**Local development — step-by-step (PowerShell)**

1) Install dependencies for both server and client

```powershell
# from repo root
cd .\server
npm install
cd ..\client
npm install
```

2) Start the backend and frontend (in separate terminals)

```powershell
# Terminal A: start server
cd .\server
npm run dev

# Terminal B: start client
cd .\client
npm run dev
```

The frontend will typically be available at `http://localhost:5173` and the server at `http://localhost:5000` (or the port set in `.env`).

**API usage examples**

- Upload a file (multipart/form-data) and request basic analysis:

```bash
curl -v -F "file=@/path/to/file.pdf" http://localhost:5000/api/analyze/upload
```

- Upload a file and request LLM analysis (server expects the form field `useLLM` to be the string `true`):

```bash
curl -v -F "file=@/path/to/image.png" -F "useLLM=true" http://localhost:5000/api/analyze/upload
```

- Get recent analyses (JSON):

```bash
curl http://localhost:5000/api/analyze/recent
```

- Clear all analyses (use with caution):

```bash
curl -X DELETE http://localhost:5000/api/analyze/clear
```

**Request details**
- Endpoint: `POST /api/analyze/upload`
- Form field: `file` (binary file), accepted types: `application/pdf`, `image/png`, `image/jpeg`
- Optional form field: `useLLM` (string) — set to `true` to trigger Groq LLM analysis

**Production notes**
- The frontend produces a static build via `npm run build` in `client`. You can host the built files on any static hosting service or configure Express to serve the built assets.
- To build the frontend:

```powershell
cd .\client
npm run build
```

To serve the built frontend from `server`, you can add a static middleware in Express (not included by default).

**Why Groq may fail**
- If `GROQ_API_KEY` is missing or invalid, the app will still perform basic heuristic analysis but LLM-powered suggestions will be skipped and an explanatory suggestion will be returned.

**Files of note**
- `server/src/controllers/analyzeController.js` — file parsing, OCR, LLM integration, DB save flow
- `server/src/services/llmService.js` — Groq SDK usage (requires `GROQ_API_KEY`)
- `client/src/components/UploadArea.jsx` — client upload logic

**Troubleshooting**
- If uploads fail with `Unsupported file type`, confirm the `Content-Type` and file extension match accepted types.
- If MongoDB connection fails, check `MONGO_URI` and network accessibility.
- If OCR is inaccurate, ensure `eng.traineddata` exists (project root includes `eng.traineddata`) and Tesseract can access it.

**Testing & linting**
- Server: no automated tests provided. Start server with `npm run dev` in `server`.
- Client: lint with `npm run lint` in `client`.

**Contributing**
- Fork the repo and open a branch for your change: `feature/your-change`.
- Open a pull request and include a short description of the change and how to test it.
