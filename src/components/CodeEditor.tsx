import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Play, Save, Users } from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  sessionId?: string;
  initialLanguage?: string;
  initialCode?: string;
}

export const CodeEditor = ({ sessionId, initialLanguage = "javascript", initialCode = "" }: CodeEditorProps) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || getStarterCode(initialLanguage));
  const [output, setOutput] = useState("");

  function getStarterCode(lang: string) {
    switch (lang) {
      case "python":
        return "# Python Code\nprint('Hello, World!')";
      case "javascript":
        return "// JavaScript Code\nconsole.log('Hello, World!');";
      case "c":
        return "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}";
      case "nodejs":
        return "// Node.js Code\nconst message = 'Hello, World!';\nconsole.log(message);";
      default:
        return "// Write your code here";
    }
  }

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(getStarterCode(newLang));
  };

  const handleRun = () => {
    // Simulate code execution
    toast.info("Code execution coming soon!");
    setOutput("Code execution will be available in the next update.");
  };

  const handleSave = () => {
    toast.success("Code saved successfully!");
  };

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E]">
      {/* VS Code-style toolbar */}
      <div className="bg-[#252526] border-b border-[#3E3E42] p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px] bg-[#3C3C3C] border-[#3E3E42] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#252526] border-[#3E3E42]">
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="nodejs">Node.js</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Collaborative Session</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="bg-[#0E639C] hover:bg-[#1177BB] border-none text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            className="bg-[#0E639C] hover:bg-[#1177BB] border-none text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full font-mono text-sm bg-[#1E1E1E] text-white border-none resize-none focus:ring-0"
            style={{
              fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
              lineHeight: "1.6",
            }}
            placeholder="Write your code here..."
          />
        </div>

        {/* Output panel */}
        <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l border-[#3E3E42] bg-[#252526] p-4">
          <div className="text-xs font-semibold text-white mb-2">OUTPUT</div>
          <div className="bg-[#1E1E1E] p-3 rounded text-sm text-white font-mono h-[calc(100%-30px)] overflow-auto">
            {output || "Run code to see output..."}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-[#007ACC] text-white text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span className="uppercase">{language}</span>
        </div>
        <div>
          <span className="opacity-75">CodeCollab Editor v1.0</span>
        </div>
      </div>
    </div>
  );
};
