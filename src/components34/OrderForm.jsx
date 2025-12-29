export default function OrderForm({ placeOrder }) {
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  return (
    <div className="order-form">
      <select onChange={(e) => setSide(e.target.value)}>
        <option>BUY</option>
        <option>SELL</option>
      </select>

      <input placeholder="Price" onChange={e => setPrice(+e.target.value)} />
      <input placeholder="Quantity" onChange={e => setQuantity(+e.target.value)} />

      <button
        onClick={() =>
          placeOrder({ side, price, quantity })
        }
      >
        Place Order
      </button>
    </div>
  );
}
