# Lumino

### Instantly summarize YouTube videos in Sinhala using the power of Google Gemini AI.

---

## 🌟 Overview

**Lumino** is a lightweight Chrome extension that provides instant, concise summaries of YouTube videos, specifically in the **Sinhala language**. By leveraging the power of the Google Gemini API, Lumino helps you quickly grasp the main points of a video without watching the entire thing.

This project is not just a tool; it's a demonstration of how powerful generative AI can be when integrated into everyday browsing, making information more accessible and convenient for the Sinhala-speaking community.

---

## 💡 Features

* **One-Click Summarization:** Get a concise summary of any YouTube video with a single click from the extension's popup.
* **Sinhala Language Support:** Specifically designed to provide summaries in the Sinhala language, making it highly relevant for local audiences.
* **Powered by Google Gemini:** Leverages the state-of-the-art Google Gemini API for accurate and high-quality summarization.
* **Lightweight & Fast:** Built as a simple and efficient Chrome extension that won't slow down your browser.

---

## 🚀 Getting Started

### Prerequisites

* A **Google Gemini API Key**. You can get a free one from [Google AI Studio](https://aistudio.google.com/app/apikey).
* Node.js and npm installed to run the backend server.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/UpenaNuhansi/Lumino.git](https://github.com/UpenaNuhansi/Lumino.git)
    cd Lumino
    ```

2.  **Set up the Backend Server**
    * Navigate to the `backend` directory.
    * Install dependencies and start the server:
        ```bash
        cd backend
        npm install
        npm start
        ```
    The server will run on `http://localhost:3000`.

3.  **Load the Chrome Extension**
    * Open your Chrome browser and go to `chrome://extensions/`.
    * Enable **Developer mode** in the top-right corner.
    * Click on **"Load unpacked"** and select the `extension` folder from the cloned repository.
    * The Lumino extension icon will appear in your browser toolbar.

## 📖 How it Works

Lumino functions by sending a request from your Chrome extension to a local backend server. This server then makes a secure call to the Google Gemini API, sending the video's transcript as a prompt. The API processes the request and returns a summary, which the server then sends back to the extension to be displayed to you.

---
## 🧪 Testing & Quality

To ensure the reliability and availability of the core summarization service, we use automated API testing integrated into our Continuous Integration (CI) pipeline.

* **Tooling:** API requests are authored in **Postman** and executed in our GitHub Actions workflow using **Newman**.
* **Report:** The latest test run resulted in **0 failures** across all requests. A detailed, dashboard-style HTML report (using the `htmlextra` reporter) is generated as a build artifact.

### 📊 API Test Results Summary

The following table outlines the requests made against the local proxy server (`http://127.0.0.1:3000`), demonstrating successful API connectivity and functionality:

| Request Name | Method | Endpoint | HTTP Status | Response Time (Avg.) | Key Function |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Generate Sinhala Summary** | `POST` | `/summarize` | `200 OK` | `16s` | **Core Functionality:** Validates that the server successfully calls the Gemini API and returns a summary. |
| **List Models** | `GET` | `/models` | `200 OK` | `151ms` | **API Health Check:** Validates connectivity to the proxy server and the model listing logic. |
| **Total Requests** | | | | | **2** |

---

## 📋 Detailed Test Cases  
- You can view all manual and functional test cases for Lumino here: [View Test Cases on Google Sheets](https://docs.google.com/spreadsheets/d/1o229bQGDtYhuVivhp_FrQhh5cZcJmYQ_1zbZaaNkFUY/edit?usp=sharing)

---

## 🤝 Contribution

We welcome contributions! Whether it's a new feature idea, a bug fix, or a translation improvement, your help is valuable. Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
