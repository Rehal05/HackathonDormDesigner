import { Building } from "../data/rooms";

interface BuildingCardProps {
  building: Building;
  roomCount: number;
  imageUrl: string;
  onClick: () => void;
  isSelected: boolean;
}

export function BuildingCard({ building, roomCount, imageUrl, onClick, isSelected }: BuildingCardProps) {
  return (
    <div
      className="overflow-hidden cursor-pointer transition-all duration-150"
      style={{
        backgroundColor: isSelected ? "var(--elevated)" : "var(--surface)",
        border: isSelected 
          ? "1px solid var(--border-active)" 
          : "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        borderLeft: isSelected ? "2px solid var(--accent-teal)" : undefined,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "var(--elevated)";
          e.currentTarget.style.borderColor = "var(--border-hover)";
          e.currentTarget.style.borderLeft = "2px solid var(--accent-teal)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "var(--surface)";
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.borderLeft = "1px solid var(--border-default)";
        }
      }}
    >
      <div 
        className="relative h-[120px] flex items-center justify-center"
        style={{ backgroundColor: "#13131A" }}
      >
        <img
          src={imageUrl}
          alt={building.name}
          className="w-full h-full object-cover"
        />
        
        <div 
          className="absolute top-2 right-2 px-3 py-1"
          style={{
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: "rgba(15, 15, 19, 0.85)", 
              color: "var(--accent-purple)",
              borderRadius: "var(--radius-pill)",
              padding: "3px 8px",
              backdropFilter: "blur(6px)",
              border: "1px solid var(--border-default)",
            
          }}
        >
          {roomCount} layouts
        </div>
      </div>

      <div style={{ padding: "10px 12px" }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            color: "var(--text-primary)",
          }}
        >
          {building.name}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          {building.campus}
        </div>
      </div>
    </div>
  );
}
