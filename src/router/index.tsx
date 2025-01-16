import { createBrowserRouter } from "react-router-dom";
import Launchpad from "@/pages/Launchpad";
import React from 'react';

const router = createBrowserRouter([
  {
    path: "/launchpad",
    element: <Launchpad />,
  },
]);

export default router; 