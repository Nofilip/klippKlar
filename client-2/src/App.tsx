import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndexTest from "./pages/indexTest.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexTest />} />
      </Routes>
    </BrowserRouter>
  );
}
