// components/stream/common/globalStyles.ts
export const globalStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  
  * { box-sizing: border-box; }
  
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { 
    background: rgba(148, 163, 184, 0.3); 
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover { 
    background: rgba(148, 163, 184, 0.5); 
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
`;