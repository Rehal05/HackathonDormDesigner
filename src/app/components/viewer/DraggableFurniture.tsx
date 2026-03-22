import { MODEL_URLS, FURNITURE_MODEL_MAP } from "../../data/models";

// Replace your existing model loading block with this:
function FurnitureModel({ furnitureId, dimensions, scaleFactor = 1.0 }: {
  furnitureId: string;
  dimensions?: { w: number; h: number; d: number };
  scaleFactor?: number;
}) {
  const modelKey = FURNITURE_MODEL_MAP[furnitureId];
  const url = modelKey ? MODEL_URLS[modelKey] : null;
  const [loadError, setLoadError] = useState(false);

  if (!url || loadError) {
    // Fallback: plain box in a muted color
    const d = dimensions ?? { w: 0.8, h: 0.8, d: 0.8 };
    return (
      <mesh>
        <boxGeometry args={[d.w, d.h, d.d]} />
        <meshLambertMaterial color={0xccbbaa} />
      </mesh>
    );
  }

  return (
    <Suspense fallback={
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshLambertMaterial color={0xdddddd} />
      </mesh>
    }>
      <LoadedModel
        url={url}
        dimensions={dimensions}
        scaleFactor={scaleFactor}
        onError={() => setLoadError(true)}
      />
    </Suspense>
  );
}

function LoadedModel({ url, dimensions, scaleFactor = 1.0, onError }: {
  url: string;
  dimensions?: { w: number; h: number; d: number };
  scaleFactor: number;
  onError: () => void;
}) {
  const { scene } = useGLTF(url);

  const scale = useMemo(() => {
    if (!dimensions) return scaleFactor;
    // Compute model's natural bounds
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Scale to fit target dimensions, then apply scaleFactor on top
    const sx = (dimensions.w / size.x) * scaleFactor;
    const sy = (dimensions.h / size.y) * scaleFactor;
    const sz = (dimensions.d / size.z) * scaleFactor;
    return [sx, sy, sz] as [number, number, number];
  }, [scene, dimensions, scaleFactor]);

  // Clone scene so multiple instances don't share the same object
  const cloned = useMemo(() => scene.clone(), [scene]);

  return <primitive object={cloned} scale={scale} />;
}