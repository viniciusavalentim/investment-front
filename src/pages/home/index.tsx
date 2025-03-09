import { FindLatestStocks } from "@/api/find-last-stocks";
import { FindStocks, StockInfo } from "@/api/find-stocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatApiFormulaMagica, formatApiResponse, formatApiRoic, formatApiSomenteEy } from "@/utils/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileText, Loader2, RotateCw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { FindAllStocks } from "@/api/find-stocks-db";
import { useNavigate } from "react-router-dom";


function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

const generateCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
};


export function Home() {

    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [filteredData, setFilteredData] = useState<StockInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");


    //Aqui ele busca do banco de dados a ultima requisição feita
    const { data: findLatestStock } = useQuery({
        queryKey: ["findLatestStocks"],
        queryFn: FindLatestStocks,
    });

    //Aqui ele busca do banco de dados a ultima requisição feita
    const { data: findAllStocks } = useQuery({
        queryKey: ["findAllStocks"],
        queryFn: FindAllStocks,
    })

    // Query for fetching new stocks (initially disabled)
    const { refetch: refetchStocks, isFetching: isFetchingStocks } = useQuery({
        queryKey: ["findStocks"],
        queryFn: FindStocks,
        enabled: false,
        onSuccess: () => {
            queryClient.invalidateQueries(["findLatestStocks"]);
            queryClient.invalidateQueries(["findAllStocks"]);
        },
    })
    const tableRef = useRef<HTMLDivElement>(null)

    const generatePDF = async () => {
        if (tableRef.current) {
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a0",
            })

            const scale = 2
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            const canvas = await html2canvas(tableRef.current, {
                scale: scale,
                useCORS: true,
                logging: true,
                backgroundColor: "#18181b",
                width: tableRef.current.offsetWidth,
                height: tableRef.current.offsetHeight,
            })

            const imgData = canvas.toDataURL("image/png")
            const imgWidth = pdfWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
            heightLeft -= pdfHeight

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
            }
            const dateNow = generateCurrentDate();
            pdf.save(`tabela-acoes-${dateNow}.pdf`);
        }
    }

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

    const handleClick = async () => {
        await refetchStocks();
    }

    useEffect(() => {
        if (findLatestStock?.data) {
            const jsonString = JSON.stringify(findLatestStock);
            const sizeInBytes = new Blob([jsonString]).size;
            console.log("Size in bytes: ", sizeInBytes);
            setFilteredData(findLatestStock.data);
        }
    }, [findLatestStock])

    return (
        <div className="flex items-center justify-center flex-col space-y-6 mt-24">
            <div>
                <Button
                    className="px-8 py-6 bg-violet-700 hover:bg-violet-800 flex items-center gap-2 group transform transition-transform duration-300 hover:scale-105"
                    onClick={handleClick}
                    disabled={isFetchingStocks}
                >
                    {isFetchingStocks ? (
                        <>
                            Buscando...
                            <Loader2 className="animate-spin-slow" />
                        </>
                    ) : (
                        <>
                            Buscar ações
                            <RotateCw className="transform transition-transform group-hover:animate-spin360" />
                        </>
                    )}
                </Button>
            </div>

            <div className="w-full px-3 lg:px-24 py-6">
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

                <Tabs defaultValue="peq" className="w-full">
                    <div className="grid grid-cols-1 lg:flex items-center justify-between">
                        <TabsList className="w-full flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 p-1">
                            <TabsTrigger value="peq" className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                                PEQ
                            </TabsTrigger>
                            <TabsTrigger value="fm" className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                                Formulá mágica
                            </TabsTrigger>
                            <TabsTrigger value="ey" className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                                Earnings Yield
                            </TabsTrigger>
                            <TabsTrigger value="roic" className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                                Roic
                            </TabsTrigger>
                            {/* <TabsTrigger value="ddd" className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                                Todas as Atualizações
                            </TabsTrigger> */}
                        </TabsList>
                    </div>
                    <div className="flex flex-col mt-6">
                        <Button
                            onClick={generatePDF}
                        >
                            Baixar
                            <FileText />
                        </Button>
                        <div className="flex justify-start my-6">
                            <div className="p-3 border border-zinc-800 bg-zinc-900 w-full lg:w-46">
                                <h1 className="text-sm text-zinc-50">
                                    Data da ultima atualização:
                                    <span className="font-bold ml-2">
                                        {findLatestStock?.createdAt && formatDate(findLatestStock?.createdAt)}
                                    </span>
                                </h1>
                            </div>
                        </div>
                    </div>
                    <TabsContent value="table" ref={tableRef}>
                        <table className="w-full text-white border border-zinc-800">
                            {/* Cabeçalho da tabela */}
                            <thead>
                                <tr className="bg-zinc-900">
                                    <th className="border border-zinc-800 p-2 w-[150px]">Posição</th>
                                    <th className="border border-zinc-800 p-2 w-[150px]">Ticker</th>
                                    <th className="border border-zinc-800 p-2">Cotação</th>
                                    <th className="border border-zinc-800 p-2">DY</th>
                                    <th className="border border-zinc-800 p-2">P/L</th>
                                    <th className="border border-zinc-800 p-2">P/VP</th>
                                    {/* <th className="border border-zinc-800 p-2">ROE</th> */}
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
                                {filteredData && filteredData && filteredData.length > 0 ? (
                                    formatApiResponse(filteredData).map((stock, index) => {
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
                                                <td className="border border-zinc-800 p-2">{dividendYield}</td>
                                                <td className="border border-zinc-800 p-2">{stock.indicators["P/L"]}</td>
                                                <td className="border border-zinc-800 p-2">{stock.indicators["P/VP"]}</td>
                                                {/* <td className="border border-zinc-800 p-2">{stock.indicators["ROE"]}</td> */}
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
                    </TabsContent>
                    <TabsContent value="peq">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formatApiResponse(filteredData).map((stock, index) => (
                                <div key={index} className="bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <img src={stock.logo || "/placeholder.svg"} alt={stock.tag} className="h-8 w-8" />
                                            <span className="font-bold text-lg">{stock.tag}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">#{index + 1}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Cotação: {stock.cotacao}</div>
                                        <div>P/L: {stock.indicators["P/L"]}</div>
                                        <div>P/VP: {stock.indicators["P/VP"]}</div>
                                        <div>ROE: {stock.indicators["ROE"]}</div>
                                        <div>ROIC: {stock.indicators["ROIC"]}</div>
                                        <div>EV/EBIT: {stock.indicators["EV/EBIT"]}</div>
                                    </div>
                                    <div className="mt-2 text-center font-bold">Total de Pontos: {stock.soma_pontos}</div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="fm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formatApiFormulaMagica(filteredData).map((stock, index) => (
                                <div key={index} className="bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <img src={stock.logo || "/placeholder.svg"} alt={stock.tag} className="h-8 w-8" />
                                            <span className="font-bold text-lg">{stock.tag}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">#{index + 1}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Cotação: {stock.cotacao}</div>
                                        <div>P/L: {stock.indicators["P/L"]}</div>
                                        <div>P/VP: {stock.indicators["P/VP"]}</div>
                                        <div>ROE: {stock.indicators["ROE"]}</div>
                                        <div>ROIC: {stock.indicators["ROIC"]}</div>
                                        <div>EV/EBIT: {stock.indicators["EV/EBIT"]}</div>
                                    </div>
                                    <div className="mt-2 text-center font-bold">Total de Pontos: {stock.soma_pontos}</div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="ey">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formatApiSomenteEy(filteredData).map((stock, index) => (
                                <div key={index} className="bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <img src={stock.logo || "/placeholder.svg"} alt={stock.tag} className="h-8 w-8" />
                                            <span className="font-bold text-lg">{stock.tag}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">#{index + 1}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Cotação: {stock.cotacao}</div>
                                        <div>P/L: {stock.indicators["P/L"]}</div>
                                        <div>P/VP: {stock.indicators["P/VP"]}</div>
                                        <div>ROE: {stock.indicators["ROE"]}</div>
                                        <div>ROIC: {stock.indicators["ROIC"]}</div>
                                        <div>EV/EBIT: {stock.indicators["EV/EBIT"]}</div>
                                    </div>
                                    <div className="mt-2 text-center font-bold">Total de Pontos: {stock.soma_pontos}</div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="roic">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formatApiRoic(filteredData).map((stock, index) => (
                                <div key={index} className="bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <img src={stock.logo || "/placeholder.svg"} alt={stock.tag} className="h-8 w-8" />
                                            <span className="font-bold text-lg">{stock.tag}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">#{index + 1}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Cotação: {stock.cotacao}</div>
                                        <div>P/L: {stock.indicators["P/L"]}</div>
                                        <div>P/VP: {stock.indicators["P/VP"]}</div>
                                        <div>ROE: {stock.indicators["ROE"]}</div>
                                        <div>ROIC: {stock.indicators["ROIC"]}</div>
                                        <div>EV/EBIT: {stock.indicators["EV/EBIT"]}</div>
                                    </div>
                                    <div className="mt-2 text-center font-bold">Total de Pontos: {stock.soma_pontos}</div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="ddd">
                        <div className="space-y-3">
                            {findAllStocks && findAllStocks.stocks && findAllStocks.stocks.map((obj) => (
                                <div key={obj.id + "atualizações"} className="w-full bg-zinc-900 flex justify-between items-center rounded-lg p-6">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-3 h-3 bg-violet-600 rounded-full"></div>
                                        <span className="font-bold text-zinc-100">
                                            Ver Atualização: <span className="font-medium">{formatDate(obj.createdAt)}</span>
                                        </span>
                                    </div>
                                    <div>
                                        <Button size={'icon'} onClick={() => navigate(`/${obj.id}`)}><ArrowRight /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
}
