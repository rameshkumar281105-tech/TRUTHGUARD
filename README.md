# 🛡️ TruthGuard AI

### AI-Assisted News Verification and Fake News Detection Platform

TruthGuard AI is a modern web-based news verification platform designed to help users evaluate whether a news claim is likely to be **REAL, FAKE, or UNCERTAIN**.

The system combines deterministic linguistic analysis, source credibility evaluation, web-based evidence retrieval, and claim-to-evidence matching to provide an explainable verification result.

---

## 📌 Project Overview

The rapid spread of misinformation through social media and online platforms makes it difficult for users to determine whether a news article or claim is trustworthy.

**TruthGuard AI** addresses this problem by analyzing submitted news content and comparing claims against information retrieved from online sources.

The platform provides:

- News credibility analysis
- Fake-news risk detection
- Source credibility evaluation
- Claim extraction
- Web evidence retrieval
- Claim/evidence matching
- Confidence scoring
- Explainable verification results
- User-friendly verification dashboard

---

## 🎯 Objectives

The main objectives of TruthGuard AI are:

1. Detect potentially misleading or fake news.
2. Analyze linguistic characteristics of submitted content.
3. Retrieve supporting or contradicting evidence from the web.
4. Evaluate the credibility of available sources.
5. Match claims with retrieved evidence.
6. Provide an understandable verification result.
7. Reduce dependence on external Large Language Model APIs.
8. Provide an explainable and transparent verification pipeline.

---

## ✨ Key Features

### 🔍 News Verification

Users can submit a news article, headline, or claim for analysis.

The system evaluates the content and produces one of three primary results:

- 🟢 **REAL**
- 🔴 **FAKE**
- 🟡 **UNCERTAIN**

---

### 🧠 Linguistic Analysis

TruthGuard analyzes characteristics of the submitted text, including:

- Sensational language
- Attribution indicators
- Emotional wording
- Claim patterns
- Other linguistic credibility signals

These signals contribute to the overall credibility assessment.

---

### 🌐 Web Evidence Retrieval

The verification pipeline searches for relevant external evidence.

The system is designed to use:

- Google News RSS
- DuckDuckGo fallback search

Retrieved sources are supplied to the verification pipeline for further analysis.

---

### 📰 Source Credibility

Sources are evaluated according to credibility-related signals.

The system considers information such as:

- Source/domain reputation
- Evidence relevance
- Agreement with the submitted claim
- Contradicting evidence
- Supporting evidence

---

### 📋 Claim Extraction

News content can contain multiple individual claims.

TruthGuard identifies important claims and generates relevant search queries that can be used to retrieve supporting evidence.

---

### 🔗 Claim-to-Evidence Matching

Retrieved sources are compared against individual claims.

The system attempts to determine whether available evidence:

- Supports the claim
- Contradicts the claim
- Does not provide enough information

---

### 📊 Confidence and Risk Scoring

The platform generates credibility-related scores to help explain the final result.

The system uses thresholds to classify results:

```text
Credibility >= 62
        ↓
      REAL

Credibility <= 40
        ↓
      FAKE

40 < Credibility < 62
        ↓
    UNCERTAIN
