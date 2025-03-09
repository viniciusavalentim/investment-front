import { StockInfo } from "@/api/find-stocks";


export function formatApiResponse(data: StockInfo[]): StockInfo[] {

    // 1. Calcular os pontos para 'pontos_roic'
    const dataWithRoicPoints = [...data].map((item) => {
        const roic = parseFloat(item.indicators.ROIC.replace('%', '').trim());
        return { ...item, roic };
    }).sort((a, b) => b.roic - a.roic)
        .map((item, index) => ({ ...item, pontos_roic: index + 1 }));

    // 2. Calcular os pontos para 'pontos_ey'
    const dataWithEyPoints = dataWithRoicPoints.map(item => {
        const evEbit = parseFloat(item.indicators["EV/EBIT"]);
        const ey = 1 / evEbit * 100;
        return { ...item, ey };
    }).sort((a, b) => b.ey - a.ey)
        .map((item, index) => ({ ...item, pontos_ey: index + 1 }));

    // 3. Calcular os pontos para 'pontos_preco'
    const dataWithPrecoPoints = dataWithEyPoints.map(item => {
        const pl = parseFloat(item.indicators["P/L"]);
        const pvp = parseFloat(item.indicators["P/VP"]);
        const preco = pl * pvp;
        return { ...item, preco };
    }).sort((a, b) => a.preco - b.preco)
        .map((item, index) => ({ ...item, pontos_preco: index + 1 }));

    // 4. Calcular a soma dos pontos e adicionar 'soma_pontos'
    const finalData = dataWithPrecoPoints.map(item => {
        const soma_pontos = (item.pontos_roic || 0) + (item.pontos_ey || 0) + (item.pontos_preco || 0);
        return { ...item, soma_pontos };
    }).sort((a, b) => a.soma_pontos - b.soma_pontos);

    return finalData;
}


export function formatApiPEQ(data: StockInfo[]): StockInfo[] {

    // 1. Calcular os pontos para 'pontos_roic'
    const dataWithRoicPoints = [...data].map((item) => {
        const roic = parseFloat(item.indicators.ROIC.replace('%', '').trim());
        return { ...item, roic };
    }).sort((a, b) => b.roic - a.roic)
        .map((item, index) => ({ ...item, pontos_roic: index + 1 }));

    // 2. Calcular os pontos para 'pontos_ey'
    const dataWithEyPoints = dataWithRoicPoints.map(item => {
        const evEbit = parseFloat(item.indicators["EV/EBIT"]);
        const ey = 1 / evEbit * 100;
        return { ...item, ey };
    }).sort((a, b) => b.ey - a.ey)
        .map((item, index) => ({ ...item, pontos_ey: index + 1 }));

    // 3. Calcular os pontos para 'pontos_preco'
    const dataWithPrecoPoints = dataWithEyPoints.map(item => {
        const pl = parseFloat(item.indicators["P/L"]);
        const pvp = parseFloat(item.indicators["P/VP"]);
        const preco = pl * pvp;
        return { ...item, preco };
    }).sort((a, b) => a.preco - b.preco)
        .map((item, index) => ({ ...item, pontos_preco: index + 1 }));

    // 4. Calcular a soma dos pontos e adicionar 'soma_pontos'
    const finalData = dataWithPrecoPoints.map(item => {
        const soma_pontos = (item.pontos_roic || 0) + (item.pontos_ey || 0) + (item.pontos_preco || 0);
        return { ...item, soma_pontos };
    }).sort((a, b) => a.soma_pontos - b.soma_pontos);

    return finalData;
}

export function formatApiFormulaMagica(data: StockInfo[]): StockInfo[] {

    // 1. Calcular os pontos para 'pontos_roic'
    const dataWithRoicPoints = [...data].map((item) => {
        const roic = parseFloat(item.indicators.ROIC.replace('%', '').trim());
        return { ...item, roic };
    }).sort((a, b) => b.roic - a.roic)
        .map((item, index) => ({ ...item, pontos_roic: index + 1 }));

    // 2. Calcular os pontos para 'pontos_ey'
    const dataWithEyPoints = dataWithRoicPoints.map(item => {
        const evEbit = parseFloat(item.indicators["EV/EBIT"]);
        const ey = 1 / evEbit * 100;
        return { ...item, ey };
    }).sort((a, b) => b.ey - a.ey)
        .map((item, index) => ({ ...item, pontos_ey: index + 1 }));

    // 4. Calcular a soma dos pontos e adicionar 'soma_pontos'
    const finalData = dataWithEyPoints.map(item => {
        const soma_pontos = (item.pontos_roic || 0) + (item.pontos_ey || 0);
        return { ...item, soma_pontos };
    }).sort((a, b) => a.soma_pontos - b.soma_pontos);

    return finalData;
}

export function formatApiSomenteEy(data: StockInfo[]): StockInfo[] {
    // 2. Calcular os pontos para 'pontos_ey'
    const dataWithEyPoints = data.map(item => {
        const evEbit = parseFloat(item.indicators["EV/EBIT"]);
        const ey = 1 / evEbit * 100;
        return { ...item, ey };
    }).sort((a, b) => b.ey - a.ey)
        .map((item, index) => ({ ...item, pontos_ey: index + 1 }));

    const finalData = dataWithEyPoints.map(item => {
        const soma_pontos = (item.pontos_ey || 0);
        return { ...item, soma_pontos };
    }).sort((a, b) => a.soma_pontos - b.soma_pontos);

    return finalData;
}

export function formatApiRoic(data: StockInfo[]): StockInfo[] {
    const dataWithRoicPoints = [...data].map((item) => {
        const roic = parseFloat(item.indicators.ROIC.replace('%', '').trim());
        return { ...item, roic };
    }).sort((a, b) => b.roic - a.roic)
        .map((item, index) => ({ ...item, pontos_roic: index + 1 }));

    const finalData = dataWithRoicPoints.map(item => {
        const soma_pontos = (item.pontos_roic || 0);
        return { ...item, soma_pontos };
    }).sort((a, b) => a.soma_pontos - b.soma_pontos);

    return finalData;
}







