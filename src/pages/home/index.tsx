import { FindLatestStocks } from "@/api/find-last-stocks";
import { FindStocks, StockInfo } from "@/api/find-stocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatApiResponse } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { RotateCw, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


/* const TOTAL_DURATION = 150;
const QUERY_DURATION = 140; */


export function Home() {

    const [isClicked, setIsClicked] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredData, setFilteredData] = useState<StockInfo[]>([]);

    /* const [progress, setProgress] = useState(0);
    const [isQueryStarted, setIsQueryStarted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false); */

    const { data: findLatestStock } = useQuery({
        queryKey: ['findLatestStocks'],
        queryFn: FindLatestStocks,
    });



    const { data: findStocksResult, refetch } = useQuery({
        queryKey: ['findStocks'],
        queryFn: FindStocks,
        enabled: isClicked
    });

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term) {
            if (findLatestStock) {
                setFilteredData(findLatestStock.data);
                return;
            } else {
                toast.error("ação não encontrada");
            }
        }

        if (!findLatestStock?.data) {
            toast.error("ação não encontrada");
            return;
        }

        const lowerTerm = term.toLowerCase();
        const filtered = findLatestStock.data.filter((stock) =>
            stock.tag.toLowerCase().includes(lowerTerm)
        );
        setFilteredData(filtered);
    };

    const handleClick = () => {
        setIsClicked(true);
        refetch();
    };

    /*  useEffect(() => {
         let timer: NodeJS.Timeout;
         let startTime: number;
 
         const animate = (timestamp: number) => {
             if (!startTime) startTime = timestamp;
             const elapsedTime = (timestamp - startTime) / 1000;
 
             if (elapsedTime <= TOTAL_DURATION) {
                 const newProgress = (elapsedTime / TOTAL_DURATION) * 100;
                 setProgress(newProgress);
 
                 if (!isQueryStarted && elapsedTime >= TOTAL_DURATION - QUERY_DURATION) {
                     setIsQueryStarted(true);
                     refetch();
                 }
 
                 requestAnimationFrame(animate);
             } else {
                 setProgress(100);
                 setIsCompleted(true);
             }
         };
 
         requestAnimationFrame(animate);
 
         return () => {
             if (timer) {
                 clearTimeout(timer);
             }
         };
     }, [refetch]); */

    return (
        <div className="flex items-center justify-center flex-col space-y-6 mt-24">
            <div>
                <Button
                    className="px-8 py-6 bg-violet-700 hover:bg-violet-800 flex items-center gap-2 group transform transition-transform duration-300 hover:scale-105"
                    onClick={handleClick}
                >
                    Buscar ações
                    <RotateCw className="transform transition-transform group-hover:animate-spin360" />
                </Button>
            </div>
            {/* {isClicked && (
                <div className="w-full max-w-md mt-6">
                    <Progress value={progress} className="w-full "   />
                    {isCompleted && (
                        <div className="mt-4">
                            {findStocksResult ? (
                                <p>Dados obtidos com sucesso!</p>
                            ) : (
                                <p>Aguardando conclusão da requisição...</p>
                            )}
                        </div>
                    )}
                </div>
            )} */}
            <div className="w-full px-24 py-6">
                <div className="relative my-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="text-gray-400" />
                    </div>
                    <Input
                        className="bg-zinc-900 border border-zinc-800 text-gray-300 pl-10"
                        placeholder="Pesquise pela tag da ação"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <table className="w-full text-white border border-zinc-800">
                    {/* Cabeçalho da tabela */}
                    <thead>
                        <tr className="bg-zinc-900">
                            <th className="border border-zinc-800 p-2 w-[150px]">Posição</th>
                            <th className="border border-zinc-800 p-2 w-[150px]">Ticker</th>
                            <th className="border border-zinc-800 p-2">Cotação</th>
                            <th className="border border-zinc-800 p-2">P/L</th>
                            <th className="border border-zinc-800 p-2">P/VP</th>
                            <th className="border border-zinc-800 p-2">ROE</th>
                            <th className="border border-zinc-800 p-2">DY</th>
                            <th className="border border-zinc-800 p-2">EV/EBIT</th>
                            <th className="border border-zinc-800 p-2">ROIC</th>
                            <th className="border border-zinc-800 p-2">EY</th>
                            <th className="border border-zinc-800 p-2">P/L x P/VP</th>
                            <th className="border border-zinc-800 bg-green-600 p-2">PONTOS ROIC</th>
                            <th className="border border-zinc-800 bg-green-600 p-2">PONTOS EY</th>
                            <th className="border border-zinc-800 bg-green-600 p-2">PONTOS PREÇO</th>
                            <th className="border border-zinc-800 bg-blue-600 p-2">TOTAL DE PONTOS</th>

                        </tr>
                    </thead>
                    <tbody>
                        {findLatestStock && findLatestStock.data && findLatestStock.data.length > 0 ? (
                            formatApiResponse(findLatestStock.data).map((stock, index) => {
                                const dividendYieldKey = `DIVIDEND_YIELD_-_${stock.tag}`;
                                const dividendYield = stock.indicators[dividendYieldKey] || "N/A";

                                return (
                                    <tr key={index} className="text-center">
                                        <td className="border border-zinc-800 p-2">{index + 1}º</td>
                                        <td className="border  w-[150px] border-zinc-800 p-2 flex gap-2 items-center justify-center font-bold">
                                            <img src={stock.logo} alt={stock.tag} className="h-10" />
                                            {stock.tag}
                                        </td>
                                        <td className="border border-zinc-800 p-2">{stock.cotacao}</td>
                                        <td className="border border-zinc-800 p-2">{stock.indicators["P/L"]}</td>
                                        <td className="border border-zinc-800 p-2">{stock.indicators["P/VP"]}</td>
                                        <td className="border border-zinc-800 p-2">{stock.indicators["ROE"]}</td>
                                        <td className="border border-zinc-800 p-2">{dividendYield}</td>
                                        <td className="border border-zinc-800 p-2">{stock.indicators["EV/EBIT"]}</td>
                                        <td className="border border-zinc-800 p-2">{stock.indicators["ROIC"]}</td>
                                        <td className="border border-zinc-800 p-2"> {(1 / parseFloat(stock.indicators["EV/EBIT"].replace(",", ".")) * 100).toFixed(1)}</td>
                                        <td className="border border-zinc-800 p-2">{(parseFloat(stock.indicators["P/L"].replace(",", ".")) * parseFloat(stock.indicators["P/VP"].replace(",", "."))).toFixed(1)}</td>
                                        <td className="border border-zinc-800 p-2">{stock.pontos_roic}</td>
                                        <td className="border border-zinc-800 p-2">{stock.pontos_ey}</td>
                                        <td className="border border-zinc-800 p-2">{stock.pontos_preco}</td>
                                        <td className="border border-zinc-800 p-2">{stock.soma_pontos}</td>

                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={16} className="text-center p-4">
                                    Nenhuma ação encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
