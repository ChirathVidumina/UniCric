import re
def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'Tournaments.jsx' in filepath:
        content = content.replace(
            '<BarChart3 size={16} /> 4. Tournament Stats\n        </button>',
            '<BarChart3 size={16} /> 4. Tournament Stats\n        </button>\n      </div>'
        )
        content = content.replace(
            '<div style={{ overflowX: \'auto\'', 
            '<div className="mobile-scroll" style={{ overflowX: \'auto\''
        )
        content = content.replace(
            '<div style={{ background: \'var(--bg-subtle)\', borderRadius: \'8px\', padding: \'0.75rem\', overflow: \'hidden\' }}>',
            '<div className="mobile-scroll" style={{ background: \'var(--bg-subtle)\', borderRadius: \'8px\', padding: \'0.75rem\', overflow: \'hidden\' }}>'
        )
    content = re.sub(
        r'<div([^>]*?)(style={{[^}]*display:\s*\'grid\',[^}]*}})',
        r'<div className="mobile-col-1"\1\2',
        content
    )
    content = content.replace('className="stats-grid"', 'className="stats-grid mobile-col-1"')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/pages/Dashboard.jsx')
process_file('src/pages/Tournaments.jsx')
process_file('src/pages/UOMOppositionScout.jsx')
