export default function TradeHistory({ trades }) {
  return (
    <div>
      <h3>Trades</h3>
      {trades.map((t, i) => (
        <div key={i}>
          {t.side} {t.qty} @ {t.price}
        </div>
      ))}
    </div>
  );
}
