import { FindStockById } from "@/api/find-stock-by-id";
import { formatApiResponse } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";


function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
}



export function History() {

    const navigate = useNavigate();
    const { id } = useParams();

    const { data: findStockById } = useQuery({
        queryKey: ["findStockById", id],
        queryFn: () => FindStockById({
            id: id ? id : ''
        }),
    });

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
            const dateNow = formatDate(findStockById?.stock.createdAt ? findStockById?.stock.createdAt : '');
            pdf.save(`tabela-acoes-${dateNow}.pdf`);
        }
    }

    return (
        <>
            <div className="flex items-center flex-col mt-24">
                <div className="text-zinc-400 my-12 flex justify-start gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <ArrowLeft /> Voltar
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={generatePDF}
                        size={"icon"}
                    >
                        <FileText />
                    </Button>
                    <div className="flex justify-start my-6">
                        <div className="p-3 border border-zinc-800 bg-zinc-900 w-full lg:w-46">
                            <h1 className="text-sm text-zinc-50">
                                Data dessa atualização:
                                <span className="font-bold ml-2">
                                    {findStockById?.stock.createdAt && formatDate(findStockById?.stock.createdAt)}
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>


                <div className="w-full px-24" ref={tableRef}>
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
                            {findStockById?.stock ? (
                                formatApiResponse(findStockById.stock.data).map((stock, index) => {
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
        </>
    )
}