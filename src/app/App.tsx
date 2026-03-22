import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FurnitureProvider } from "./context/FurnitureContext";

export default function App() {
  return (
    <FurnitureProvider>
      <RouterProvider router={router} />
    </FurnitureProvider>
  );
}