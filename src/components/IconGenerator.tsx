import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_PROMPT = `Professional app icon for 'ComandaPro' restaurant order management system. 
Modern flat design, rounded square shape with smooth corners. 
Features a stylized clipboard or digital receipt with elegant checkmarks. 
Color palette: turquoise/teal primary (#14b8a6), dark teal accents. 
Clean, minimalist, professional look suitable for mobile app. 
No text, pure icon design. High contrast, vibrant colors.`;

export const IconGenerator = () => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateIcon = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-icon', {
        body: { prompt }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Lovable AI returns imageUrl directly
      const imageUrl = data.imageUrl;
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        toast({
          title: "Ícone gerado!",
          description: "O ícone foi gerado com sucesso.",
        });
      } else {
        throw new Error('No image data returned');
      }
    } catch (error: any) {
      console.error('Error generating icon:', error);
      toast({
        title: "Erro ao gerar ícone",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'comandapro-icon.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "O ícone está sendo baixado.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerador de Ícone - ComandaPro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt para geração:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o ícone que deseja gerar..."
              className="min-h-[150px] text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateIcon}
              disabled={isLoading || !prompt.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Ícone
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setPrompt(DEFAULT_PROMPT)}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedImage && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg">Ícone Gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={generatedImage}
                  alt="Generated Icon"
                  className="w-48 h-48 rounded-2xl shadow-lg border border-border"
                />
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              <Button onClick={downloadImage} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar Ícone
              </Button>
              <Button onClick={generateIcon} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Nova Variação
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Após baixar, salve o arquivo como <code>src/assets/comandapro-icon.png</code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
