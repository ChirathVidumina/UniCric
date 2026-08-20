import re

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initial state for selected match
content = content.replace("const [selectedCompletedMatchId, setSelectedCompletedMatchId] = useState(null);", "const [selectedCompletedMatchId, setSelectedCompletedMatchId] = useState('m1');")

# 2. Update card wrapper and button logic
old_card = """                <div 
                  key={item.id}
                  style={{
                    background: item.status === 'NEXT_TARGET' ? 'rgba(220, 38, 38, 0.15)' : 'var(--bg-card)',
                    border: item.status === 'NEXT_TARGET' ? '2px solid #dc2626' : '1px solid var(--border-color)',"""

new_card = """                <div 
                  key={item.id}
                  onClick={() => item.status === 'COMPLETED' && setSelectedCompletedMatchId(item.id)}
                  style={{
                    cursor: item.status === 'COMPLETED' ? 'pointer' : 'default',
                    background: item.id === selectedCompletedMatchId ? 'rgba(16, 185, 129, 0.05)' : item.status === 'NEXT_TARGET' ? 'rgba(220, 38, 38, 0.15)' : 'var(--bg-card)',
                    border: item.id === selectedCompletedMatchId ? '2px solid #10b981' : item.status === 'NEXT_TARGET' ? '2px solid #dc2626' : '1px solid var(--border-color)',
                    boxShadow: item.id === selectedCompletedMatchId ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none',
                    transform: item.id === selectedCompletedMatchId ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s ease',"""

content = content.replace(old_card, new_card)

old_button = """                    <button 
                      onClick={() => {
                        setShowFullScorecardView(false);
                        setShowMatchSummaryModal(true);
                        setSelectedCompletedMatchId(item.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid var(--accent-green)',
                        borderRadius: '6px',
                        color: 'var(--accent-green)',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <FileText size={16} /> View Match Scoreboard
                    </button>"""

new_button = """                    <button 
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        background: item.id === selectedCompletedMatchId ? 'linear-gradient(135deg, #059669, #047857)' : 'rgba(16, 185, 129, 0.15)',
                        border: item.id === selectedCompletedMatchId ? 'none' : '1px solid var(--accent-green)',
                        borderRadius: '6px',
                        color: item.id === selectedCompletedMatchId ? 'white' : 'var(--accent-green)',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FileText size={16} /> {item.id === selectedCompletedMatchId ? 'Viewing Scorecard' : 'View Match Scoreboard'}
                    </button>"""
                    
content = content.replace(old_button, new_button)

# 3. Move the scorecard logic to render INLINE instead of as an overlay.
# The user wants it rendered BELOW the cards. 
# We need to find the end of the cards grid.
# It's at:
end_of_grid = """              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              No championship match fixtures logged yet.
            </div>
          )}"""
          
# We want to extract the widget block.
# We will use regex to find {activeScorecard && showMatchSummaryModal && !showFullScorecardView && ( ... )}
# and remove it from its original place, modify it, and put it after the grid.

# We will just write a function to balance braces and extract the block.
def extract_block(text, start_str):
    start_idx = text.find(start_str)
    if start_idx == -1: return None, text
    
    # Find the opening parenthesis after start_str
    paren_start = text.find('(', start_idx)
    open_count = 1
    i = paren_start + 1
    while open_count > 0 and i < len(text):
        if text[i] == '(': open_count += 1
        elif text[i] == ')': open_count -= 1
        i += 1
    
    # We found the matching )
    # The block ends with )}
    end_idx = text.find('}', i)
    block = text[start_idx:end_idx+1]
    new_text = text[:start_idx] + text[end_idx+1:]
    return block, new_text

block1, content = extract_block(content, "{activeScorecard && showMatchSummaryModal && !showFullScorecardView && (")
block2, content = extract_block(content, "{activeScorecard && showFullScorecardView && (")

if block1:
    # Remove the modal overlay wrapper
    # Original: <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 19, 41, 0.8)', backdropFilter: 'blur(20px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', overflowY: 'hidden' }}>
    # We'll just replace it with an inline div.
    block1 = re.sub(r'<div style=\{\{ position: \'fixed\', inset: 0,.*?zIndex: 99999,.*?\}\}>', '<div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>', block1)
    
    # Remove the close buttons
    block1 = re.sub(r'<button[^>]*onClick=\{[^}]*setShowMatchSummaryModal\(false\)[^}]*\}[^>]*>.*?</button>', '', block1, flags=re.DOTALL)
    # Remove the "Expand Full Scorecard" button and just let them view it inline
    block1 = re.sub(r'<button[^>]*onClick=\{[^}]*setShowFullScorecardView\(true\)[^}]*\}[^>]*>.*?</button>', '', block1, flags=re.DOTALL)
    
    # Change the condition from `{activeScorecard && showMatchSummaryModal && !showFullScorecardView && (` to `{activeScorecard && (`
    block1 = block1.replace("{activeScorecard && showMatchSummaryModal && !showFullScorecardView && (", "{activeScorecard && (")

if block1:
    content = content.replace(end_of_grid, end_of_grid + "\n\n          {/* INTERACTIVE INLINE SCORECARD */}\n          " + block1)

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Tournaments.jsx inline scorecard logic.")
