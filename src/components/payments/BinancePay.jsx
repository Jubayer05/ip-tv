import { useState } from "react";

export default function BinancePay({
  orderNumber, // pass this for order payments
  userId, // or pass this for wallet deposits
  amount = 50,
  currency = "USDT",
  payId = process.env.NEXT_PUBLIC_BINANCE_PAY_ID || "986642974",
  qrUrl, // optional QR image
}) {
  const [binanceOrderId, setBinanceOrderId] = useState("");
  const [status, setStatus] = useState(null);

  async function verify() {
    setStatus("Checking…");
    const body = orderNumber
      ? { orderNumber, amount, currency, orderId: binanceOrderId }
      : { userId, amount, currency, orderId: binanceOrderId };

    const r = await fetch("/api/payments/binance/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (j.ok) setStatus("✅ Payment verified.");
    else setStatus(`❌ ${j.error || "Verification failed"}`);
  }

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <h3>Pay with Binance Internal Transfer</h3>
      <ol>
        <li>
          Send{" "}
          <b>
            {amount} {currency}
          </b>{" "}
          to Pay ID: <b>{payId}</b>
        </li>
        <li>Scan QR:</li>
      </ol>
      {qrUrl && (
        <img
          src={qrUrl}
          alt="QR"
          style={{ width: 200, height: 200, objectFit: "contain" }}
        />
      )}
      <hr />
      <div>
        <label>Enter your Binance Order ID</label>
        <input
          value={binanceOrderId}
          onChange={(e) => setBinanceOrderId(e.target.value)}
          placeholder="e.g. 1234567890123456"
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        />
        <button
          onClick={verify}
          style={{ marginTop: 12, padding: "10px 16px" }}
        >
          Verify Payment
        </button>
      </div>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
      <p style={{ marginTop: 8, fontSize: 12, color: "#777" }}>
        Tip: Binance App → Wallet → Transaction History → Select transfer → copy{" "}
        <b>Order ID</b>.
      </p>
    </div>
  );
}
