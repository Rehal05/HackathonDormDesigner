import { Room } from "../data/rooms";

interface RoomCardProps {
  room: Room;
  onClick: () => void;
  isSelected: boolean;
}

export function RoomCard({ room, onClick, isSelected }: RoomCardProps) {
  return (
    <div
      className="overflow-hidden cursor-pointer transition-all duration-150 group"
      style={{
        backgroundColor: isSelected ? "var(--elevated)" : "var(--surface)",
        border: isSelected 
          ? "1px solid var(--border-active)" 
          : "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        borderLeft: isSelected ? "2px solid var(--accent-coral)" : undefined,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "var(--elevated)";
          e.currentTarget.style.borderColor = "var(--border-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "var(--surface)";
          e.currentTarget.style.borderColor = "var(--border-default)";
        }
      }}
    >
      <div 
        className="relative h-[140px] flex items-center justify-center"
        style={{ backgroundColor: "#13131A" }}
      >
        <img
          src={room.imageUrl}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        
        <div 
          className="absolute top-2 right-2 px-2 py-1"
          style={{
            fontSize: "10px",
            backgroundColor: "rgba(30, 30, 40, 0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: "var(--radius-pill)",
            color: "var(--text-primary)",
          }}
        >
          {room.occupancy}
        </div>

        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-150 group-hover:h-[2px]"
          style={{
            backgroundColor: "var(--accent-coral)",
            opacity: 0,
          }}
          ref={(el) => {
            if (el) {
              el.parentElement?.addEventListener('mouseenter', () => {
                el.style.opacity = '1';
              });
              el.parentElement?.addEventListener('mouseleave', () => {
                el.style.opacity = '0';
              });
            }
          }}
        />
      </div>

      <div style={{ padding: "10px 12px 4px" }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: "13px",
            color: "var(--text-primary)",
          }}
        >
          {room.name}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          {room.dimensions} · {room.sqft}sqft
        </div>
      </div>

      <div style={{ padding: "3px 12px 10px" }}>
        <button
          className="transition-colors duration-150"
          style={{
            fontSize: "11px",
            color: "var(--accent-purple)",
            backgroundColor: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent-teal)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--accent-purple)";
          }}
        >
          Open room →
        </button>
      </div>
    </div>
  );
}