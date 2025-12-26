import { useState } from "react";
import UploadPage from "./components/UploadPage";
import DashboardLayout from "./components/DashboardLayout";

export default function App() {
  const [fileName, setFileName] = useState<string | null>(null);

  if (!fileName) {
    return <UploadPage onSuccess={setFileName} />;
  }

  return <DashboardLayout fileName={fileName} />;
}
