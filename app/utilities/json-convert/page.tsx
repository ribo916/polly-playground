"use client";

import { useState } from "react";

const conversionInfo = {
  'ui-to-external': {
    title: 'UI/PE3 → External API /pricing-scenario',
    description: 'Converts internal UI to pricing engine format to external API format'
  },
  'getloan-to-external': {
    title: 'getLoan → External API /pricing-scenario',
    description: 'Converts getLoan response to external API pricing-scenario request'
  },
  'external-to-getloan': {
    title: 'External API → getLoan',
    description: 'Converts external API pricing-scenario request to getLoan format'
  }
};

export default function JsonConvertPage() {
  const [currentConversion, setCurrentConversion] = useState<'ui-to-external' | 'getloan-to-external' | 'external-to-getloan'>('ui-to-external');
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleConvert = async () => {
    if (!inputJson.trim()) {
      showMessage('Please enter JSON to convert', 'error');
      return;
    }

    try {
      const inputData = JSON.parse(inputJson);
      
      const response = await fetch(`/api/convert/${currentConversion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        showMessage(`Conversion failed: ${errorData.error || response.statusText}`, 'error');
        return;
      }

      const result = await response.json();

      if (result.success) {
        setOutputJson(JSON.stringify(result.data, null, 2));
        showMessage('✓ Conversion successful!', 'success');
      } else {
        showMessage(`Conversion failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        showMessage(`Invalid JSON: ${error.message}`, 'error');
      } else {
        showMessage(`Error: ${error.message || 'Unknown error occurred'}`, 'error');
      }
    }
  };

  const handleCopy = async () => {
    if (!outputJson) {
      showMessage('Nothing to copy', 'error');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(outputJson);
      showMessage('✓ Copied to clipboard!', 'success');
    } catch {
      showMessage('Failed to copy', 'error');
    }
  };

  const handleClear = () => {
    setInputJson('');
    setOutputJson('');
    setMessage(null);
    showMessage('Cleared', 'success');
  };

  const info = conversionInfo[currentConversion];

  return (
    <div className="max-w-7xl mx-auto pt-14">
      <div
        className="rounded-xl p-8 mb-5"
        style={{
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <button
            onClick={() => {
              setCurrentConversion('ui-to-external');
              setInputJson('');
              setOutputJson('');
              setMessage(null);
            }}
            className="px-4 py-2 rounded font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--button-text)",
          }}
          >
            1. UI/PE3 → pricingScenario
          </button>
          <button
            onClick={() => {
              setCurrentConversion('getloan-to-external');
              setInputJson('');
              setOutputJson('');
              setMessage(null);
            }}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--button-text)",
            }}
          >
            2. getLoan → pricingScenario
          </button>
          <button
            onClick={() => {
              setCurrentConversion('external-to-getloan');
              setInputJson('');
              setOutputJson('');
              setMessage(null);
            }}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--button-text)",
            }}
          >
            3. pricingScenario → createLoan
          </button>
        </div>

        <div
          className="p-4 rounded-lg mb-5 border-l-4"
          style={{
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderLeftColor: 'var(--accent)',
            color: 'var(--foreground)'
          }}
        >
          {info.description}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="flex flex-col">
            <div
              className="px-4 py-3 rounded-t-lg font-semibold"
              style={{
                backgroundColor: 'var(--background)',
                borderBottom: '2px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Input JSON
            </div>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder="Paste your JSON here..."
              className="w-full min-h-[400px] p-4 rounded-b-lg font-mono text-sm leading-relaxed resize-y focus:outline-none"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
            />
          </div>
          <div className="flex flex-col">
            <div
              className="px-4 py-3 rounded-t-lg font-semibold"
              style={{
                backgroundColor: 'var(--background)',
                borderBottom: '2px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Converted JSON
            </div>
            <textarea
              value={outputJson}
              readOnly
              placeholder="Converted JSON will appear here..."
              className="w-full min-h-[400px] p-4 rounded-b-lg font-mono text-sm leading-relaxed resize-y focus:outline-none"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleConvert}
            className="px-8 py-3 rounded-lg font-semibold text-base transition-all hover:transform hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
              color: 'var(--button-text)'
            }}
          >
            🔄 Convert
          </button>
          <button
            onClick={handleCopy}
            className="px-8 py-3 rounded-lg font-semibold text-base transition-all"
            style={{
              backgroundColor: '#28a745',
              color: 'white'
            }}
          >
            📋 Copy Output
          </button>
          <button
            onClick={handleClear}
            className="px-8 py-3 rounded-lg font-semibold text-base transition-all"
            style={{
              backgroundColor: '#6c757d',
              color: 'white'
            }}
          >
            🗑️ Clear
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg border-l-4 ${
              message.type === 'error'
                ? 'bg-red-100 text-red-800 border-red-400'
                : 'bg-green-100 text-green-800 border-green-400'
            }`}
            style={{
              backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda',
              color: message.type === 'error' ? '#721c24' : '#155724',
              borderLeftColor: message.type === 'error' ? '#f5c6cb' : '#c3e6cb'
            }}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

