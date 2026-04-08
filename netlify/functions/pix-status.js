const https = require('https');

const PIX_HOSTNAME = 'www.pagamentos-seguros.app';
const PIX_PATH = '/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';
const PIX_API_KEY = 'c7f720bc11ea455f0b1d92128206c79d';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

function httpsGet(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: PIX_HOSTNAME,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Api-Key': PIX_API_KEY,
                'Authorization': 'Bearer ' + PIX_API_KEY
            },
            timeout: 15000
        };
        const req = https.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => { raw += chunk; });
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
                resolve({ statusCode: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed, raw });
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
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

        const result = await httpsGet(PIX_PATH + '?transactionId=' + encodeURIComponent(txid));
        const d = result.data || {};

        if (!result.ok) {
            const errMsg = d.error || d.message || 'Transação não encontrada';
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: errMsg }) };
        }

        const rawStatus = String(d.status || '').toUpperCase();
        const normalized = (rawStatus === 'COMPLETED' || rawStatus === 'PAID' || rawStatus === 'APPROVED') ? 'paid' : 'pending';

        return {
            statusCode: 200,
            headers: { ...CORS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: normalized, statusRaw: rawStatus, paidAt: d.paidAt || null })
        };

    } catch (err) {
        console.error('[pix-status] exception:', err.message);
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Erro: ' + err.message }) };
    }
};
