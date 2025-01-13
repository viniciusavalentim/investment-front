import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export function Home() {
    return (
        <div className="flex items-center justify-center h-screen flex-col space-y-4">

            <div>
                <Button className="px-8 py-6 bg-violet-700 hover:bg-violet-800 flex items-center gap-2 group transform transition-transform duration-300 hover:scale-105">
                    Buscar ações
                    <RotateCw className="transform transition-transform group-hover:animate-spin360" />
                </Button>
            </div>
            <div>
                
                {/* Aqui vai ficar a tabela  */}
                <div className="w-[500px] h-[300px] border border-zinc-800"></div>
            </div>
        </div>
    );
}
