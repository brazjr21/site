const https = require('https');

const PIX_URL = 'https://www.pagamentos-seguros.app/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

function httpsRequest(url, method, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const bodyStr = body ? JSON.stringify(body) : null;
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; ifoodbag/1.0)'
            }
        };
        if (bodyStr) {
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }
        const req = https.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => { raw += chunk; });
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
                resolve({
                    statusCode: res.statusCode,
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    data: parsed,
                    raw: raw
                });
            });
        });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
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

        const customer = {
            name: String(personal?.name || 'Cliente iFood').trim(),
            document: cpfDigits || '00000000000',
            email: String(personal?.email || 'cliente@ifoodbag.app').trim(),
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
            paymentMethod: 'PIX',
            utm: utmString
        };

        console.log('PIX create request:', JSON.stringify({ amount: amountBRL, customer }));

        const result = await httpsRequest(PIX_URL, 'POST', payload);

        console.log('PIX gateway response:', result.statusCode, result.raw ? result.raw.substring(0, 500) : '');

        if (!result.ok) {
            const data = result.data || {};
            const errMsg = data.error || data.message || data.msg || data.detail || data.erro
                || `Gateway retornou ${result.statusCode}`;
            console.error('PIX gateway error:', result.statusCode, errMsg);
            return {
                statusCode: 400, headers: CORS,
                body: JSON.stringify({ error: errMsg })
            };
        }

        const data = result.data || {};
        const txId = data.transactionId || data.transaction_id || data.id || data.txid || '';
        const pixCode = data.pixCode || data.pix_code || data.qrCode || data.qr_code || data.emv || data.code || '';

        if (!txId || !pixCode) {
            console.error('PIX gateway missing fields. Response:', result.raw ? result.raw.substring(0, 500) : '');
            return {
                statusCode: 500, headers: CORS,
                body: JSON.stringify({ error: 'Resposta inválida do gateway de pagamento.' })
            };
        }

        return {
            statusCode: 200,
            headers: { ...CORS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idTransaction: txId,
                paymentCode: pixCode,
                paymentQrUrl: data.paymentQrUrl || data.qrCodeImage || data.qr_code_image || '',
                status: 'pending',
                gateway: 'pagamentos-seguros'
            })
        };

    } catch (err) {
        console.error('PIX create exception:', err.message, err.stack);
        return {
            statusCode: 500, headers: CORS,
            body: JSON.stringify({ error: 'Erro interno ao gerar PIX: ' + err.message })
        };
    }
};
