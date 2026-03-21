import { useState } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/navbar";
import { BuildingCard } from "../components/building-card";
import { RoomCard } from "../components/room-card";
import { buildings, getRoomsByBuilding } from "../data/rooms";

// Building images
const buildingImages = [
  "https://images.unsplash.com/photo-1750863774182-06f0103b6b48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmclMjBleHRlcmlvcnxlbnwxfHx8fDE3NzQxMTk1NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1581634928711-e19c3d57478d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwZG9ybSUyMGJ1aWxkaW5nJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3NDExOTU0OXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1769421977169-c45b3faa6b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGhhbGwlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzQxMTk1NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

// Room images
const roomImages = [
  "https://images.unsplash.com/photo-1564273795917-fe399b763988?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwcm9vbSUyMHNpbmdsZSUyMGJlZCUyMGRlc2t8ZW58MXx8fHwxNzc0MTE3OTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1549881567-c622c1080d78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwcm9vbSUyMGRvdWJsZSUyMGJlZHN8ZW58MXx8fHwxNzc0MTE3OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1701725383848-443a670bea56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwZG9ybSUyMHJvb20lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzQxMTc5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1765663241884-ebd171bdda1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYmVkcm9vbSUyMHNpbmdsZXxlbnwxfHx8fDE3NzQxMTc5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1655450075012-c0393e3cc1ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwdHdvJTIwYmVkc3xlbnwxfHx8fDE3NzQxMTc5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1723236228646-32b96ebc52b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJlZHJvb20lMjBkZXNrJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3NDExNzk4MHww&ixlib=rb-4.1.0&q=80&w=1080",
];

export function Landing() {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showRoomGrid, setShowRoomGrid] = useState(false);

  const rooms = selectedBuilding ? getRoomsByBuilding(selectedBuilding) : [];
  
  // Assign images to rooms
  rooms.forEach((room, index) => {
    room.imageUrl = roomImages[index % roomImages.length];
  });

  const handleBuildingClick = (buildingId: string) => {
    if (selectedBuilding === buildingId) {
      setSelectedBuilding(null);
      setShowRoomGrid(false);
    } else {
      setSelectedBuilding(buildingId);
      setShowRoomGrid(false);
      setTimeout(() => setShowRoomGrid(true), 10);
    }
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/visualizer/${selectedBuilding}/${roomId}`);
  };

  const selectedBuildingData = buildings.find(b => b.id === selectedBuilding);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Hero */}
        <div className="pt-12 pb-9 max-w-[600px]">
          <div
            style={{
              fontSize: "10px",
              color: "var(--accent-teal)",
              letterSpacing: "0.1em",
              fontWeight: 500,
            }}
          >
            3D DORM VISUALIZER
          </div>
          
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "42px",
              color: "var(--text-primary)",
              marginTop: "8px",
              lineHeight: 1.2,
            }}
          >
            See your room before move-in.
          </h1>
          
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              marginTop: "12px",
              maxWidth: "460px",
              lineHeight: 1.6,
            }}
          >
            Explore available dorm rooms in 3D and plan your layout with our interactive visualizer. Choose your furniture, see estimated costs, and make move-in day stress-free.
          </p>
        </div>

        {/* Building Grid */}
        <div className="mt-10">
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
              fontWeight: 500,
              marginBottom: "10px",
            }}
          >
            SELECT YOUR BUILDING
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            {buildings.map((building, index) => (
              <BuildingCard
                key={building.id}
                building={building}
                roomCount={getRoomsByBuilding(building.id).length}
                imageUrl={buildingImages[index % buildingImages.length]}
                onClick={() => handleBuildingClick(building.id)}
                isSelected={selectedBuilding === building.id}
              />
            ))}
          </div>
        </div>

        {/* Room Grid */}
        {showRoomGrid && selectedBuildingData && (
          <div className="mt-5" style={{
            animation: "fadeInUp 180ms ease-out",
          }}>
            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(6px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>

            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              ROOMS IN {selectedBuildingData.name.toUpperCase()}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onClick={() => handleRoomClick(room.id)}
                  isSelected={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div 
          className="mt-12 pt-9"
          style={{
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "28px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "32px",
                  color: "var(--accent-purple)",
                  opacity: 0.18,
                }}
              >
                01
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  marginTop: "8px",
                  fontWeight: 500,
                }}
              >
                Pick your room
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "6px",
                  lineHeight: 1.5,
                }}
              >
                Browse buildings and view detailed room specs including dimensions and occupancy type.
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "32px",
                  color: "var(--accent-purple)",
                  opacity: 0.18,
                }}
              >
                02
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  marginTop: "8px",
                  fontWeight: 500,
                }}
              >
                Arrange furniture
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "6px",
                  lineHeight: 1.5,
                }}
              >
                Use the 3D visualizer to place furniture and plan your perfect layout before move-in.
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "32px",
                  color: "var(--accent-purple)",
                  opacity: 0.18,
                }}
              >
                03
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  marginTop: "8px",
                  fontWeight: 500,
                }}
              >
                Export your layout
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "6px",
                  lineHeight: 1.5,
                }}
              >
                Download your room design as a PNG and share it with roommates or family.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between py-5 mt-12"
          style={{
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
            }}
          >
            DormDraft
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Built for move-in day
          </div>
        </div>
      </div>
    </div>
  );
}
