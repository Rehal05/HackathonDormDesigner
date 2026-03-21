import { Link, useLocation } from "react-router";

export function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav 
      className="h-[52px] sticky top-0 z-50 flex items-center justify-between px-6 border-b"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="flex items-center gap-3">
        <Link 
          to="/"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "17px",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          DormDraft
        </Link>
        
        {isLanding && (
          <>
            <div 
              className="w-px h-4"
              style={{ backgroundColor: "var(--border-default)" }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              North Campus
            </span>
          </>
        )}
      </div>

      {isLanding && (
        <div className="flex items-center gap-4">
          <button
            className="px-3 py-1.5 transition-colors duration-150"
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            How it works
          </button>
          
          <button
            className="px-4 py-1.5 transition-all duration-150"
            style={{
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              color: "var(--text-primary)",
              backgroundColor: "var(--accent-purple)",
              border: "none",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Start designing →
          </button>
        </div>
      )}
    </nav>
  );
}
