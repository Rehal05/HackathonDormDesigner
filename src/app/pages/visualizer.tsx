import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ZoomIn, ZoomOut, Maximize2, Grid3x3, Search } from "lucide-react";
import { getRoomById, getBuildingById } from "../data/rooms";
import { furniture, furnitureCategories, FurnitureItem } from "../data/furniture";

// Set furniture images
const furnitureImages: Record<string, string> = {
  "bed-1": "https://images.unsplash.com/photo-1655450075012-c0393e3cc1ce?w=200",
  "bed-2": "https://images.unsplash.com/photo-1655450075012-c0393e3cc1ce?w=200",
  "bed-3": "https://images.unsplash.com/photo-1655450075012-c0393e3cc1ce?w=200",
  "bed-4": "https://images.unsplash.com/photo-1655450075012-c0393e3cc1ce?w=200",
  "desk-1": "https://images.unsplash.com/photo-1723236228646-32b96ebc52b2?w=200",
  "desk-2": "https://images.unsplash.com/photo-1723236228646-32b96ebc52b2?w=200",
  "desk-3": "https://images.unsplash.com/photo-1723236228646-32b96ebc52b2?w=200",
  "desk-4": "https://images.unsplash.com/photo-1723236228646-32b96ebc52b2?w=200",
  "desk-5": "https://images.unsplash.com/photo-1723236228646-32b96ebc52b2?w=200",
  "storage-1": "https://images.unsplash.com/photo-1771039753570-b3a1ddf868ab?w=200",
  "storage-2": "https://images.unsplash.com/photo-1771039753570-b3a1ddf868ab?w=200",
  "storage-3": "https://images.unsplash.com/photo-1771039753570-b3a1ddf868ab?w=200",
  "storage-4": "https://images.unsplash.com/photo-1771039753570-b3a1ddf868ab?w=200",
  "storage-5": "https://images.unsplash.com/photo-1771039753570-b3a1ddf868ab?w=200",
  "storage-6": "https://images.unsplash.com/photo-1771039753570-b3a1ddf868ab?w=200",
  "seating-1": "https://images.unsplash.com/photo-1757194455393-8e3134d4ce19?w=200",
  "seating-2": "https://images.unsplash.com/photo-1698041383729-38eb70ce7a08?w=200",
  "seating-3": "https://images.unsplash.com/photo-1757194455393-8e3134d4ce19?w=200",
  "seating-4": "https://images.unsplash.com/photo-1698041383729-38eb70ce7a08?w=200",
  "lighting-1": "https://images.unsplash.com/photo-1773593917074-f2938a8ee391?w=200",
  "lighting-2": "https://images.unsplash.com/photo-1773593917074-f2938a8ee391?w=200",
  "lighting-3": "https://images.unsplash.com/photo-1773593917074-f2938a8ee391?w=200",
  "lighting-4": "https://images.unsplash.com/photo-1773593917074-f2938a8ee391?w=200",
  "lighting-5": "https://images.unsplash.com/photo-1773593917074-f2938a8ee391?w=200",
  "decor-1": "https://images.unsplash.com/photo-1763909130786-09d4aa364e8d?w=200",
  "decor-2": "https://images.unsplash.com/photo-1763909130786-09d4aa364e8d?w=200",
  "decor-3": "https://images.unsplash.com/photo-1763909130786-09d4aa364e8d?w=200",
  "decor-4": "https://images.unsplash.com/photo-1763909130786-09d4aa364e8d?w=200",
  "decor-5": "https://images.unsplash.com/photo-1763909130786-09d4aa364e8d?w=200",
  "decor-6": "https://images.unsplash.com/photo-1763909130786-09d4aa364e8d?w=200",
};

furniture.forEach(item => {
  item.imageUrl = furnitureImages[item.id] || "";
});

export function Visualizer() {
  const { building: buildingId, room: roomId } = useParams();
  const [activeTab, setActiveTab] = useState<"info" | "furniture" | "about">("info");
  const [showDoor, setShowDoor] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const room = getRoomById(roomId || "");
  const building = getBuildingById(buildingId || "");

  useEffect(() => {
    // Draw a simple isometric room on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawRoom = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background
      ctx.fillStyle = "#0C0C10";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simple isometric room wireframe
      ctx.strokeStyle = "rgba(155, 135, 245, 0.3)";
      ctx.lineWidth = 2;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const width = 200;
      const height = 150;
      const depth = 180;

      // Floor
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 100);
      ctx.lineTo(centerX - width, centerY + 50);
      ctx.lineTo(centerX - width, centerY - depth + 50);
      ctx.lineTo(centerX, centerY - depth);
      ctx.lineTo(centerX + width, centerY - depth + 50);
      ctx.lineTo(centerX + width, centerY + 50);
      ctx.closePath();
      ctx.fillStyle = "rgba(93, 212, 176, 0.05)";
      ctx.fill();
      ctx.stroke();

      // Left wall
      ctx.beginPath();
      ctx.moveTo(centerX - width, centerY + 50);
      ctx.lineTo(centerX - width, centerY - depth + 50);
      ctx.lineTo(centerX - width, centerY - depth - height + 50);
      ctx.lineTo(centerX - width, centerY - height + 50);
      ctx.closePath();
      ctx.fillStyle = "rgba(110, 179, 247, 0.03)";
      ctx.fill();
      ctx.stroke();

      // Right wall
      ctx.beginPath();
      ctx.moveTo(centerX + width, centerY + 50);
      ctx.lineTo(centerX + width, centerY - depth + 50);
      ctx.lineTo(centerX + width, centerY - depth - height + 50);
      ctx.lineTo(centerX + width, centerY - height + 50);
      ctx.closePath();
      ctx.fillStyle = "rgba(240, 184, 87, 0.03)";
      ctx.fill();
      ctx.stroke();

      // Grid on floor if enabled
      if (showGrid) {
        ctx.strokeStyle = "rgba(155, 135, 245, 0.15)";
        ctx.lineWidth = 1;
        
        for (let i = 1; i < 4; i++) {
          const step = width / 4;
          // Vertical grid lines
          ctx.beginPath();
          ctx.moveTo(centerX - width + i * step * 2, centerY + 50 - i * step);
          ctx.lineTo(centerX - width + i * step * 2, centerY - depth + 50 - i * step);
          ctx.stroke();
        }
      }

      // Door indicator if enabled
      if (showDoor) {
        ctx.strokeStyle = "rgba(240, 123, 106, 0.6)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - width + 40, centerY - height + 50);
        ctx.lineTo(centerX - width + 40, centerY + 20);
        ctx.stroke();
      }

      // Simple furniture representation (bed)
      ctx.fillStyle = "rgba(155, 135, 245, 0.4)";
      ctx.fillRect(centerX - 80, centerY - 60, 100, 60);
      ctx.strokeStyle = "rgba(155, 135, 245, 0.8)";
      ctx.strokeRect(centerX - 80, centerY - 60, 100, 60);

      // Desk
      ctx.fillStyle = "rgba(93, 212, 176, 0.4)";
      ctx.fillRect(centerX + 40, centerY - 30, 80, 50);
      ctx.strokeStyle = "rgba(93, 212, 176, 0.8)";
      ctx.strokeRect(centerX + 40, centerY - 30, 80, 50);
    };

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawRoom();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [showDoor, showGrid]);

  if (!room || !building) {
    return <div>Room not found</div>;
  }

  const filteredFurniture = furniture.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "var(--background)", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav 
        className="h-[52px] flex items-center justify-between px-6 border-b"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            transition: "color 150ms",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
        >
          ← {building.name} / {room.name}
        </Link>

        <button
          className="px-4 py-2 transition-all duration-150"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: "13px",
            color: "var(--text-primary)",
            backgroundColor: "var(--elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-teal)";
            e.currentTarget.style.color = "var(--accent-teal)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
        >
          Download PNG
        </button>
      </nav>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Viewer */}
        <div 
          className="relative"
          style={{
            flex: "1 1 62%",
            minWidth: "580px",
            backgroundColor: "#0C0C10",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
            }}
          />

          {/* Toolbar */}
          <div
            className="h-[44px] flex items-center justify-center gap-2 px-4"
            style={{
              backgroundColor: "var(--surface)",
              borderTop: "1px solid var(--border-default)",
            }}
          >
            <IconButton icon={ZoomIn} onClick={() => {}} />
            <IconButton icon={ZoomOut} onClick={() => {}} />
            <IconButton icon={Maximize2} onClick={() => {}} />
            
            <div style={{ width: "1px", height: "20px", backgroundColor: "var(--border-default)", margin: "0 4px" }} />
            
            <ToggleButton
              active={showDoor}
              onClick={() => setShowDoor(!showDoor)}
              label="Door"
            />
            
            <IconButton icon={Grid3x3} onClick={() => setShowGrid(!showGrid)} active={showGrid} />
          </div>
        </div>

        {/* Sidebar */}
        <div
          style={{
            flex: "1 1 38%",
            maxWidth: "460px",
            backgroundColor: "var(--surface)",
            borderLeft: "1px solid var(--border-default)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Tabs */}
          <div
            className="h-[44px] flex border-b"
            style={{
              borderColor: "var(--border-default)",
            }}
          >
            <TabButton
              active={activeTab === "info"}
              onClick={() => setActiveTab("info")}
              label="Room Info"
            />
            <TabButton
              active={activeTab === "furniture"}
              onClick={() => setActiveTab("furniture")}
              label="Furniture"
            />
            <TabButton
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
              label="About"
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "14px 16px 72px" }}>
            {activeTab === "info" && (
              <RoomInfoTab room={room} building={building} />
            )}
            
            {activeTab === "furniture" && (
              <FurnitureTab
                furniture={filteredFurniture}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            )}
            
            {activeTab === "about" && (
              <AboutTab building={building} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, onClick, active }: { icon: any; onClick: () => void; active?: boolean }) {
  return (
    <button
      className="w-[30px] h-[30px] flex items-center justify-center transition-all duration-150"
      style={{
        backgroundColor: active ? "var(--elevated)" : "transparent",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-secondary)",
        cursor: "pointer",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--elevated)";
        e.currentTarget.style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = active ? "var(--elevated)" : "transparent";
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
    >
      <Icon size={16} />
    </button>
  );
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      className="px-3 py-1 transition-all duration-150"
      style={{
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        color: active ? "var(--accent-teal)" : "var(--text-secondary)",
        backgroundColor: active ? "rgba(93, 212, 176, 0.1)" : "transparent",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      className="flex-1 transition-all duration-150"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: "12px",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--accent-purple)" : "2px solid transparent",
        cursor: "pointer",
        padding: "12px",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {label}
    </button>
  );
}

function RoomInfoTab({ room, building }: { room: any; building: any }) {
  return (
    <div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "var(--text-primary)" }}>
        {room.name}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
        {building.name}
      </div>

      <div className="flex gap-2 mt-3">
        <Pill text={room.dimensions} />
        <Pill text={`${room.sqft}sqft`} />
        <Pill text={room.occupancy} />
      </div>

      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "12px" }}>
        {room.doorNote}
      </div>

      <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border-default)" }} />

      <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "12px" }}>
        ESTIMATED COST
      </div>

      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "26px", color: "var(--accent-amber)" }}>
        ${room.estimatedCost.toLocaleString()}
      </div>

      <div className="mt-4">
        {room.costBreakdown.map((item: any, index: number) => (
          <div
            key={index}
            className="flex justify-between py-2"
            style={{
              fontSize: "12px",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>{item.item}</span>
            <span style={{ color: "var(--text-primary)" }}>${item.amount}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>
        *Prices are estimates only
      </div>

      <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border-default)" }} />

      <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "12px" }}>
        CONTROLS
      </div>

      <div className="space-y-2">
        <ControlRow icon="🖱️" text="Click & drag to rotate view" />
        <ControlRow icon="🔍" text="Scroll to zoom in/out" />
        <ControlRow icon="⌨️" text="Arrow keys to pan camera" />
      </div>
    </div>
  );
}

function FurnitureTab({ furniture, searchQuery, onSearchChange, selectedCategory, onCategoryChange }: {
  furniture: FurnitureItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}) {
  return (
    <div>
      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          type="text"
          placeholder="Search furniture..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-[34px] pl-9 pr-3 transition-all duration-150"
          style={{
            fontSize: "13px",
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            outline: "none",
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent-purple)"}
          onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-default)"}
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <CategoryPill
          label="All"
          active={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
        />
        {furnitureCategories.map((cat) => (
          <CategoryPill
            key={cat.id}
            label={cat.label}
            active={selectedCategory === cat.id}
            onClick={() => onCategoryChange(cat.id)}
          />
        ))}
      </div>

      {/* Furniture Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
        {furniture.map((item) => (
          <FurnitureCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function AboutTab({ building }: { building: any }) {
  return (
    <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
      <p>{building.description}</p>
      <p style={{ marginTop: "12px" }}><strong style={{ color: "var(--text-primary)" }}>Building Policy:</strong> {building.policy}</p>
      <p style={{ marginTop: "12px" }}>
        For more information, visit the{" "}
        <a 
          href="#"
          style={{ color: "var(--accent-purple)", textDecoration: "underline" }}
        >
          housing portal
        </a>.
      </p>
    </div>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <div
      className="px-3 py-1.5"
      style={{
        fontSize: "12px",
        backgroundColor: "var(--elevated)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-secondary)",
      }}
    >
      {text}
    </div>
  );
}

function ControlRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{text}</span>
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className="px-3 py-1 transition-all duration-150"
      style={{
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        color: active ? "var(--accent-purple)" : "var(--text-secondary)",
        backgroundColor: active ? "#1E1A30" : "transparent",
        border: active ? "1px solid var(--accent-purple)" : "1px solid var(--border-default)",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--accent-blue)";
          e.currentTarget.style.borderColor = "var(--accent-blue)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--text-secondary)";
          e.currentTarget.style.borderColor = "var(--border-default)";
        }
      }}
    >
      {label}
    </button>
  );
}

function FurnitureCard({ item }: { item: FurnitureItem }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="p-2.5 transition-all duration-150 cursor-pointer"
      style={{
        backgroundColor: "var(--elevated)",
        border: isHovered ? "1px solid var(--accent-blue)" : "1px solid var(--border-default)",
        borderLeft: isHovered ? "2px solid var(--accent-blue)" : "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="h-[60px] mb-2 flex items-center justify-center"
        style={{
          backgroundColor: "var(--input-bg)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "12px", color: "var(--text-primary)" }}>
        {item.name}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <div style={{ fontSize: "11px", color: "var(--accent-amber)" }}>
          ${item.price}
        </div>
        
        {isHovered && (
          <button
            style={{
              fontSize: "11px",
              color: "var(--accent-purple)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}