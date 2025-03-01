import api from "@/lib/axios";

export type Indicators = {
    [key: string]: string;
}

export type StockInfo = {
    tag: string;
    cotacao: string;
    logo: string;
    indicators: Indicators;
    pontos_roic?: number;
    pontos_ey?: number;
    pontos_preco?: number;
    soma_pontos?: number;
};

export type ApiResponse = {
    latestStock: stock;
};

export type stock = {
    id: string;
    data: StockInfo[];
    createdAt: string;
};


export async function FindLatestStocks() {
    const response = await api.get<ApiResponse>("/latest-stock");
    return response.data.latestStock;
}