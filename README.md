# TruthGuard AI

Build a complete, fully functional full-stack website for my college Phase-II project:

FAKE NEWS DETECTION – REAL TIME PRE-PUBLICATION ANALYSIS

Create a real working application, NOT a static UI prototype. The system must allow users to enter a news headline/article and optionally upload an image, then return REAL / FAKE / UNCERTAIN, confidence, risk score, explanation, evidence, source credibility and publication recommendation.

TECH STACK

Frontend:

React + TypeScript + Vite

Tailwind CSS

Lucide icons

Recharts

Fully responsive

Backend:

Python + Flask/FastAPI

REST APIs

SQLite + SQLAlchemy

AI/ML:

PyTorch

Hugging Face Transformers

BERT/FakeBERT-style text classification

Computer vision model for images

Explainable AI

Multimodal score fusion

Use .env for secrets/API keys.

BRAND & DESIGN

Brand: TruthGuard AI
Subtitle: Real-Time Fake News Detection & Verification
Tagline: “Verify Before You Amplify.”

Create a professional shield/check/AI logo.

Design it as a premium AI SaaS product suitable for a final-year engineering project. Use modern typography, rounded cards, subtle gradients, clean spacing, professional charts, smooth animations and clear status badges. Support desktop, tablet and mobile. Do not make it look like a basic college website.

NAVIGATION

Sticky navbar:

TruthGuard AI | Home | Analyze | History | How It Works | Model | About

Right side: ● System Online

Add a mobile hamburger menu.

HOME PAGE

Hero:

VERIFY BEFORE YOU AMPLIFY

AI-Powered Fake News Detection

“Analyze news articles, claims and images before publication. Get an explainable AI assessment in seconds.”

Buttons:

Analyze News

See How It Works

Add a visual AI analysis panel.

Feature cards:

Multimodal Analysis

Transformer AI

Explainable AI

Fact Verification

Source Credibility

Real-Time Results

ANALYZE PAGE

Create the main analysis workspace.

Inputs:

News Headline

News Content

Source URL (optional)

Source Name (optional)

Publication Date (optional)

Image upload

Image uploader:
Drag & Drop Image Here / Browse Files
JPG, PNG, WEBP, maximum 10 MB.

Show image preview.

Button: Analyze News

When clicked:

Validate input

Send to backend

Show real loading state

Process text/image/evidence

Generate final result

Show stages such as:

Preprocessing

Transformer Analysis

Image Analysis

Fact Verification

Explainable AI

Final Verdict

RESULT PAGE

Create a professional result dashboard.

Show:

FINAL VERDICT

REAL

FAKE

UNCERTAIN

Display:

Confidence

Risk level

Overall risk score

Create score cards:

Text Credibility

Image Credibility

Source Credibility

Evidence Support

If no image exists, show Image Analysis: Not Available. Never invent scores.

Add risk meter:

0–30 Low

31–60 Moderate

61–80 High

81–100 Critical

AI EXPLANATION

Section:

Why did TruthGuard AI reach this conclusion?

Generate the explanation from the actual analysis.

Show:

Important keywords

Suspicious phrases

Linguistic indicators

Claim indicators

Sensationalism indicators

Use Explainable AI such as attention/token importance, SHAP or LIME where practical. Do not hard-code explanations.

TEXT ANALYSIS

Display:

Prediction

Confidence

Important tokens

Suspicious phrases

Sentiment

Linguistic patterns

Claim/sensationalism indicators

Use a visual token/keyword representation.

IMAGE ANALYSIS

If an image is supplied, analyze it with a suitable computer-vision model.

Display:

Image preview

Image score

Suspicion level

Visual indicators

Text/image consistency

Explanation

Statuses:

AUTHENTIC-LOOKING

SUSPICIOUS

UNABLE TO DETERMINE

Never claim absolute proof of authenticity/manipulation.

FACT VERIFICATION

Extract meaningful claims and attempt verification using available trusted external sources/APIs.

For each claim show:

Claim

Status

Evidence

Source

Relevance

Statuses:

SUPPORTED

CONTRADICTED

UNVERIFIED

If verification is unavailable, clearly display:
“External verification unavailable.”

Never fabricate evidence, sources or URLs.

SOURCE CREDIBILITY

Show available:

Domain

HTTPS

Source name

Author

Publication date

Credibility score

Missing data must show Not Provided. Never invent metadata.

RECOMMENDATION

For REAL:
LOW RISK — Evidence supports the content; normal editorial review recommended.

For FAKE:
HIGH RISK — Multiple suspicious indicators detected; verify before publication.

For UNCERTAIN:
REQUIRES REVIEW — Evidence is insufficient; perform additional manual verification.

HISTORY

Create /history.

Store and display:

Date

Headline

Verdict

Confidence

Risk

View/Delete

Add search, filtering, sorting and pagination.

Filters:
All | Real | Fake | Uncertain

Clicking View must display the complete saved analysis.

DASHBOARD

Create /dashboard with real database statistics:

Total Analyses

Real

Fake

Uncertain

Average Confidence

Add charts for prediction distribution and activity over time. Never use fake statistics.

HOW IT WORKS

Show:

Input → Text Preprocessing → Transformer Analysis → Image Analysis → Fact Verification → Multimodal Fusion → Explainable AI → Final Verdict

Explain each step simply.

MODEL PAGE

Explain:

BERT/FakeBERT

CNN

Computer Vision

Multimodal Fusion

Explainable AI

If exact FakeBERT/VisualBERT/MMBT models are unavailable, implement the closest practical working architecture and clearly state the actual model used. Never claim a model was trained if it was not.

BACKEND APIs

Implement and connect:

POST /api/analyze
POST /api/analyze/text
POST /api/analyze/image
POST /api/fact-check
GET /api/history
GET /api/history/:id
DELETE /api/history/:id
GET /api/stats
GET /api/health


AI PIPELINE

Text:

News → Preprocessing → BERT/FakeBERT → Text Prediction

Image:

Image → Preprocessing → Computer Vision → Image Score

Fusion:

Text + Image + Evidence + Source → Multimodal Fusion → Final Prediction

If no image is provided, automatically adjust the fusion.

FALLBACK MODE

The application must still work if GPU, model weights or external verification are unavailable.

Create a clearly labelled Demo / Lightweight Model Mode.

Never use random predictions or pretend a fallback is the full model.

DATABASE

Store:
id, headline, content, source_url, source_name, publication_date, image_path, prediction, confidence, risk_score, text_score, image_score, evidence_score, source_score, explanation, created_at

SECURITY

Implement:

Secure uploads

File type/size validation

Secure filenames

Input validation

Environment variables

No exposed API keys

CORS

Safe error handling

IMPORTANT

Do NOT create fake UI, fake charts, random confidence, hard-coded predictions, fake loading, fake fact-checking, invented evidence or buttons that do nothing.

All real results must come from the actual application pipeline or be clearly labelled demo data.

FINAL REQUIREMENT

Build the entire application, not just a plan or frontend mockup.

After building:

Start frontend and backend.

Test all pages.

Test text analysis.

Test image upload.

Test result generation.

Test history/database.

Test APIs.

Fix all runtime and integration errors.

Verify mobile responsiveness.

Ensure the project starts and works successfully.

The final website must be polished and suitable for Phase-II project demonstration, review and viva.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://verify-amplify.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6e130660-85be-4a01-8679-1f5917db9b86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
#   T R U T H G U A R D  
 