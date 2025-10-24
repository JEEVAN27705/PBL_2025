import React from 'react';

export default function ChatPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: 16 }}>Chat with AI</h2>
      <div style={{ background:'#1f2937', border:'1px solid #374151', borderRadius:8, padding:16, minHeight:280 }}>
        {/* Messages area (leave empty per your note) */}
      </div>
      <div style={{ display:'flex', gap:12, marginTop:12 }}>
        <input placeholder="Type your message here..." style={{ flex:1, background:'#111827', color:'#e5e7eb', border:'1px solid #374151', borderRadius:8, padding:'10px 12px' }}/>
        <button style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'10px 16px' }}>Send</button>
      </div>
      <div style={{ color:'#9aa4b2', fontSize:12, textAlign:'center', marginTop:8 }}>ChatApp can make mistakes. Consider checking important information.</div>
    </div>
  );
}
