// Lumino content script: injects UI panel and handles summary flow
(async function() {
  // Avoid injecting twice
  if (window.__luminoInjected) return;
  window.__luminoInjected = true;

  // Helpers
  const YOUTUBE_VIDEO_SELECTOR = 'ytd-watch-flexy';
  const getVideoInfo = () => {
    try {
      let title = '';
      let titleEl = document.querySelector('h1.title yt-formatted-string') ||
                   document.querySelector('h1 yt-formatted-string');
      if (titleEl) {
        title = titleEl.textContent.trim();
      } else {
        const metaTitle = document.querySelector('meta[name="title"]');
        if (metaTitle) {
          title = metaTitle.getAttribute('content').trim();
        }
      }
      const videoIdMatch = window.location.href.match(/[?&]v=([^&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      return { title, videoId };
    } catch {
      return { title: '', videoId: '' };
    }
  };

  // Gemini API call
  async function fetchGeminiSummary(promptText) {
    try {
      const response = await fetch('http://localhost:3000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      const data = await response.json();
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
      return 'No summary generated.';
    } catch (e) {
      return 'Gemini API error: ' + e.message;
    }
  }

  // Format summary for better readability
  function formatSummary(summaryText) {
    // Highlight timestamps (e.g., 01:40) and numbered points
    summaryText = summaryText.replace(/(\d{1,2}:\d{2})/g, '<span class="lumino-timestamp">$1</span>');
    // Convert numbered points to highlights
    const highlightRegex = /(\d+\.\s*)(.*?)(?=(?:\d+\.\s)|$)/gs;
    let highlights = '';
    summaryText.replace(highlightRegex, (match, num, text) => {
      highlights += `<div class="lumino-highlight"><span class="lumino-highlight-num">${num.trim()}</span> ${text.trim()}</div>`;
      return '';
    });
    if (highlights) {
      summaryText = summaryText.replace(highlightRegex, '');
      summaryText += `<div class="lumino-highlights">${highlights}</div>`;
    }
    // Bold headings
    summaryText = summaryText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    summaryText = summaryText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return summaryText;
  }

  // Create panel UI with minimize icon
  const panel = document.createElement('div');
  panel.id = 'lumino-panel';
  panel.style.position = 'fixed';
  panel.style.right = '16px';
  panel.style.bottom = '16px';
  panel.style.width = '340px';
  panel.style.maxWidth = '90vw';
  panel.style.background = '#1e1e1e';
  panel.style.color = '#fff';
  panel.style.borderRadius = '12px';
  panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  panel.style.zIndex = '999999';
  panel.style.fontFamily = 'Arial, Helvetica, sans-serif';
  panel.innerHTML = `
    <div style="padding:12px 12px 6px 12px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
      <strong>Lumino Sinhala Summary</strong>
      <span>
        <span id="lumino-expand" style="cursor:pointer; font-size:18px; color:#9ad1ff; margin-right:8px;" title="Expand">&#x21F2;</span>
        <span id="lumino-minimize" style="cursor:pointer; font-size:18px; color:#9ad1ff;" title="Minimize">&#8211;</span>
      </span>
    </div>
    <div id="lumino-content" style="padding:12px; max-height: 40vh; overflow:auto;">
      <p style="margin:0 0 8px 0; font-size:14px; color:#ddd;">
        Video: <span id="lumino-video-title" style="color:#cde; font-weight:600;">Loading...</span>
      </p>
      <textarea id="lumino-input" placeholder="Optional: paste English captions or transcript here..." style="width:100%; height:80px; resize:vertical; background:#111; color:#eee; border:1px solid #333; border-radius:6px; padding:6px;"></textarea>
      <button id="lumino-generate" style="margin-top:8px; width:100%; padding:10px; border-radius:6px; border:0; background:#4caf50; color:white; font-weight:600; cursor:pointer;">
        Generate Sinhala Summary
      </button>
      <div id="lumino-result" style="margin-top:10px; font-size:13px; color:#e8e8e8;"></div>
    </div>
  `;

  document.body.appendChild(panel);

  // Minimize/maximize functionality
  const minimizeBtn = panel.querySelector('#lumino-minimize');
  const contentDiv = panel.querySelector('#lumino-content');
  let minimized = false;
  minimizeBtn.addEventListener('click', () => {
    minimized = !minimized;
    if (minimized) {
      contentDiv.style.display = 'none';
      minimizeBtn.innerHTML = '&#x25A1;'; // maximize icon
      minimizeBtn.title = 'Maximize';
    } else {
      contentDiv.style.display = '';
      minimizeBtn.innerHTML = '&#8211;'; // minimize icon
      minimizeBtn.title = 'Minimize';
    }
  });

  // Expand functionality
  const expandBtn = panel.querySelector('#lumino-expand');
  let expanded = false;
  expandBtn.addEventListener('click', () => {
    expanded = !expanded;
    if (expanded) {
      panel.style.width = '600px';
      panel.style.maxWidth = '98vw';
      panel.style.maxHeight = '90vh';
      expandBtn.innerHTML = '&#x21F3;'; // collapse icon
      expandBtn.title = 'Collapse';
    } else {
      panel.style.width = '340px';
      panel.style.maxWidth = '90vw';
      panel.style.maxHeight = '';
      expandBtn.innerHTML = '&#x21F2;'; // expand icon
      expandBtn.title = 'Expand';
    }
  });

  // Set video title
  const videoInfo = getVideoInfo();
  const titleEl = document.getElementById('lumino-video-title');
  if (titleEl) titleEl.textContent = videoInfo.title || 'Unknown';

  // Show Gemini summary automatically
  const resultEl = document.getElementById('lumino-result');
  if (resultEl) {
    resultEl.innerHTML = '<em>Generating summary using Gemini…</em>';
    const promptText = `Summarize this YouTube video in Sinhala: ${videoInfo.title}`;
    fetchGeminiSummary(promptText).then(summary => {
      resultEl.innerHTML = `<strong>Gemini Summary (සිංහල):</strong><br/>${formatSummary(summary)}`;
    });
  }

  // Load stored content if any
  const setResult = (text) => {
    const res = document.getElementById('lumino-result');
    if (res) res.innerHTML = text;
  };

  // Summarization logic (local placeholder + optional API hook)
  const summarizeSinhala = async (sourceText) => {
    if (!sourceText || sourceText.trim().length < 20) return 'සංක්ෂිප්ත සාරාංශයක් නොමැත.';
    const chunks = sourceText.split(/[\.\!\?\n]+/).filter(s => s.trim().length > 0);
    const firstN = chunks.length >= 5 ? 5 : chunks.length;
    const summary = chunks.slice(0, firstN).join('. ').trim();
    if (!summary) return 'සංක්ෂිප්ත සාරාංශයක් නොමැත.';
    return summary;
  };

  // Button handler
  const btn = document.getElementById('lumino-generate');
  btn?.addEventListener('click', async () => {
    setResult('<em>Generating Sinhala summary…</em>');
    let sourceText = '';
    const input = document.getElementById('lumino-input');
    if (input && input.value && input.value.trim().length > 0) {
      sourceText = input.value.trim();
    } else {
      sourceText = videoInfo.title;
    }
    const promptText = `Summarize this YouTube video in Sinhala: ${sourceText}`;
    const summary = await fetchGeminiSummary(promptText);
    setResult(`<strong>Gemini Summary (සිංහල):</strong><br/>${formatSummary(summary)}`);
  });

  let lastVideoId = getVideoInfo().videoId;

  function checkForVideoChange() {
    const { videoId } = getVideoInfo();
    if (videoId && videoId !== lastVideoId) {
      lastVideoId = videoId;
      // Update video title
      const titleEl = document.getElementById('lumino-video-title');
      if (titleEl) titleEl.textContent = getVideoInfo().title || 'Unknown';
      // Generate new summary
      const resultEl = document.getElementById('lumino-result');
      if (resultEl) {
        resultEl.innerHTML = '<em>Generating summary using Gemini…</em>';
        const promptText = `Summarize this YouTube video in Sinhala: ${getVideoInfo().title}`;
        fetchGeminiSummary(promptText).then(summary => {
          resultEl.innerHTML = `<strong>Gemini Summary (සිංහල):</strong><br/>${formatSummary(summary)}`;
        });
      }
    }
  }

  // Check every second for video changes
  setInterval(checkForVideoChange, 1000);
})();