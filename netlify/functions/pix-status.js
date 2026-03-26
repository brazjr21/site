const PIX_URL = 'https://www.pagamentos-seguros.app/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { txid } = body;

        if (!txid) {
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'txid obrigatório' }) };
        }

        const extRes = await fetch(
            `${PIX_URL}?transactionId=${encodeURIComponent(txid)}`,
            { method: 'GET' }
        );

        const data = await extRes.json().catch(() => ({}));

        if (!extRes.ok) {
            return {
                statusCode: 400, headers: CORS,
                body: JSON.stringify({ error: String(data?.error || 'Transação não encontrada') })
            };
        }

        const rawStatus = String(data.status || '').toUpperCase();
        const normalized = rawStatus === 'COMPLETED' ? 'paid' : 'pending';

        return {
            statusCode: 200,
            headers: { ...CORS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: normalized,
                statusRaw: rawStatus,
                paidAt: data.paidAt || null
            })
        };

    } catch (err) {
        console.error('PIX status error:', err);
        return {
            statusCode: 500, headers: CORS,
            body: JSON.stringify({ error: 'Erro ao consultar status do PIX.' })
        };
    }
};
