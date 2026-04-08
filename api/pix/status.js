const PIX_URL = 'https://www.pagamentos-seguros.app/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { txid } = req.body || {};

        if (!txid) {
            return res.status(400).json({ error: 'txid obrigatório' });
        }

        const externalRes = await fetch(
            `${PIX_URL}?transactionId=${encodeURIComponent(txid)}`,
            { method: 'GET' }
        );

        const data = await externalRes.json().catch(() => ({}));

        if (!externalRes.ok) {
            const errMsg = String(data?.error || 'Transação não encontrada');
            return res.status(400).json({ error: errMsg });
        }

        const rawStatus = String(data.status || '').toUpperCase();
        const isPaid = rawStatus === 'COMPLETED';
        const normalized = isPaid ? 'paid' : 'pending';

        return res.status(200).json({
            status: normalized,
            statusRaw: rawStatus,
            paidAt: data.paidAt || null
        });

    } catch (err) {
        console.error('PIX status error:', err);
        return res.status(500).json({ error: 'Erro ao consultar status do PIX.' });
    }
}
