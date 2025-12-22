export default function SessionCard({ session, isOpen, onToggle }) {
    return (
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        {/* HEADER (ALTID SYNLIG) */}
        <div
          onClick={onToggle}
          style={{
            padding: 12,
            cursor: 'pointer',
            background: '#black',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <strong>{session.date}</strong><br />
            <small>{session.location}</small>
          </div>
  
          <span>{isOpen ? '−' : '+'}</span>
        </div>
  
        {/* CONTENT (KUN NÅR ÅBEN) */}
        {isOpen && (
          <div style={{ padding: 12 }}>
            {session.duration && (
              <p><strong>Varighed:</strong> {session.duration}</p>
            )}
  
            {session.exercises?.length > 0 && (
              <>
                <h4>Øvelser</h4>
                {session.exercises.map((ex, i) => (
                  <div key={i}>{ex}</div>
                ))}
              </>
            )}
  
            {session.routes?.length > 0 && (
              <>
                <h4>Ruter</h4>
                {session.routes.map((r, i) => (
                  <div key={i}>
                    {r.color} {r.number && `#${r.number}`}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    )
  }
  