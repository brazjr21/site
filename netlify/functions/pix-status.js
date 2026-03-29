const https = require('https');

const PIX_URL = 'https://www.pagamentos-seguros.app/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: 'GET'
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = {};
                try { parsed = JSON.parse(data); } catch (_) {}
                resolve({ statusCode: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

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

        const result = await httpsGet(`${PIX_URL}?transactionId=${encodeURIComponent(txid)}`);
        const data = result.data;

        if (!result.ok) {
            return {
                statusCode: 400, headers: CORS,
                body: JSON.stringify({ error: String(data?.error || 'Transação não encontrada') })
            };
        }

        const rawStatus = String(data.status || '').toUpperCase();
        const normalized = (rawStatus === 'COMPLETED' || rawStatus === 'PAID' || rawStatus === 'APPROVED') ? 'paid' : 'pending';

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
