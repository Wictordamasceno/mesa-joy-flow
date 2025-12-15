import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, User, Server, ChevronDown, ChevronUp } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [hostUrl, setHostUrl] = useState(() => localStorage.getItem("hostUrl") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor, insira seu nome");
      return;
    }

    // Save host URL if provided
    if (hostUrl.trim()) {
      localStorage.setItem("hostUrl", hostUrl.trim());
    }

    // Save attendant name
    localStorage.setItem("attendantName", name.trim());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">D</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">ComandaPro</h1>
            <p className="text-sm text-muted-foreground">by Damatech Soluções</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Nome do Atendente
            </label>
            <Input
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="h-14 text-lg bg-card border-border"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-14 text-lg" size="lg">
            Entrar
          </Button>
        </form>

        {/* Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="mt-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Configurações</span>
          {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 w-full max-w-sm p-4 bg-card rounded-xl border border-border animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                Endereço do Servidor
              </label>
              <Input
                type="url"
                placeholder="http://192.168.1.100:8080"
                value={hostUrl}
                onChange={(e) => setHostUrl(e.target.value)}
                className="h-12 bg-secondary/50 border-border"
              />
              <p className="text-xs text-muted-foreground">
                Insira o endereço IP e porta do servidor ERP
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
