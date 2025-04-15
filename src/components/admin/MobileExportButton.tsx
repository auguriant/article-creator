
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MobileExportButton = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-8 sm:hidden">
      <Button 
        onClick={() => navigate("/export")}
        className="w-full" 
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Export Standalone HTML
      </Button>
    </div>
  );
};
