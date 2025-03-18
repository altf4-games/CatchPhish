import { useState } from "react";

function ApkAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileAnalyze(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileAnalyze(file);
    }
  };

  const handleFileAnalyze = async (file) => {
    if (!file || !file.name.endsWith('.apk')) {
      setError('Please select a valid APK file');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('apk_file', file);

    try {
      const response = await fetch('http://localhost:5001/api/analyze-apk', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error("APK analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">APK Malware Analysis</h1>
      
      <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-blue-900/30 p-8 mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive 
              ? "border-blue-500 bg-blue-900/20" 
              : "border-blue-900/30 hover:border-blue-500/50 hover:bg-blue-900/10"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-white/90">
                {dragActive ? "Drop APK file here" : "Drag & Drop APK file here"}
              </p>
              <p className="text-sm text-white/60">or</p>
              <label className="px-4 py-2 bg-blue-900/30 hover:bg-blue-900/40 border border-blue-500/30 rounded-lg text-white font-medium transition-all duration-200 cursor-pointer inline-block">
                Browse Files
                <input 
                  type="file" 
                  accept=".apk" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-white/50 mt-2">Only .apk files are supported</p>
            </div>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-blue-900/30 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Selected File</h2>
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-blue-900/20">
            <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📱</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-white/60">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-blue-900/30 p-8 text-center mb-8">
          <div className="w-12 h-12 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Analyzing APK for malware...</p>
          <p className="text-sm text-white/60 mt-2">This may take a few moments</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/10 backdrop-blur rounded-xl border border-red-900/30 p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-400">Analysis Error</h3>
          </div>
          <p className="text-white/70">{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-blue-900/30 overflow-hidden">
          <div className="border-b border-blue-900/25 p-6">
            <h2 className="text-xl font-semibold">APK Analysis Results</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-900/50 rounded-lg border border-blue-900/20 p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-900/30 rounded-full flex items-center justify-center text-xs">i</span>
                  APK Information
                </h3>
                <ul className="space-y-2 text-white/80">
                  <li><span className="text-white/60">Package Name:</span> {results.package_name}</li>
                  <li><span className="text-white/60">Version:</span> {results.version}</li>
                  <li><span className="text-white/60">SDK Version:</span> {results.sdk_version}</li>
                </ul>
              </div>
              
              <div className={`rounded-lg border p-4 ${
                results.malware_score > 70 
                  ? "bg-red-900/20 border-red-900/30" 
                  : results.malware_score > 30 
                    ? "bg-yellow-900/20 border-yellow-900/30"
                    : "bg-green-900/20 border-green-900/30"
              }`}>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-slate-900/50 rounded-full flex items-center justify-center text-xs">!</span>
                  Threat Assessment
                </h3>
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span>Malware Score</span>
                    <span className={`font-medium ${
                      results.malware_score > 70 
                        ? "text-red-400" 
                        : results.malware_score > 30 
                          ? "text-yellow-400" 
                          : "text-green-400"
                    }`}>
                      {results.malware_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        results.malware_score > 70 
                          ? "bg-red-500" 
                          : results.malware_score > 30 
                            ? "bg-yellow-500" 
                            : "bg-green-500"
                      }`}
                      style={{ width: `${results.malware_score}%` }}
                    ></div>
                  </div>
                </div>
                <p className={`text-sm ${
                  results.malware_score > 70 
                    ? "text-red-400" 
                    : results.malware_score > 30 
                      ? "text-yellow-400" 
                      : "text-green-400"
                }`}>
                  {results.malware_score > 70 
                    ? "High risk - Malware detected" 
                    : results.malware_score > 30 
                      ? "Medium risk - Suspicious behavior detected" 
                      : "Low risk - No significant threats detected"}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg border border-blue-900/20 p-4 mb-6">
              <h3 className="text-lg font-medium mb-3">Permissions Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.permissions && results.permissions.map((perm, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-sm flex items-center gap-2 ${
                      perm.risk === "high" 
                        ? "bg-red-900/20 text-red-400 border border-red-900/30" 
                        : perm.risk === "medium" 
                          ? "bg-yellow-900/20 text-yellow-400 border border-yellow-900/30" 
                          : "bg-blue-900/20 text-blue-400 border border-blue-900/30"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs bg-slate-900/50">
                      {perm.risk === "high" ? "!" : "i"}
                    </span>
                    {perm.name}
                  </div>
                ))}
              </div>
            </div>
            
            {results.detections && results.detections.length > 0 && (
              <div className="bg-slate-900/50 rounded-lg border border-blue-900/20 p-4">
                <h3 className="text-lg font-medium mb-3">Detected Issues</h3>
                <ul className="space-y-2">
                  {results.detections.map((detection, index) => (
                    <li key={index} className="bg-red-900/10 border border-red-900/20 rounded-md p-3">
                      <p className="font-medium text-red-400">{detection.type}</p>
                      <p className="text-sm text-white/70">{detection.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.pdf_url && (
              <div className="bg-slate-900/50 rounded-lg border border-blue-900/20 p-4 mt-6">
                <h3 className="text-lg font-medium mb-3">PDF Report</h3>
                <a 
                  href={`http://localhost:5001${results.pdf_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-4 py-2 bg-blue-900/30 hover:bg-blue-900/40 border border-blue-500/30 rounded-lg text-white font-medium transition-all duration-200"
                >
                  Download PDF Report
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ApkAnalysis;
