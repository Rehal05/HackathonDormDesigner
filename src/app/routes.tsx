import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/landing";
import { Visualizer } from "./pages/visualizer";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/visualizer/:building/:room",
    Component: Visualizer,
  },
]);
