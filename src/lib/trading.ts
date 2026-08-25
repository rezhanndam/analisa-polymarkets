import { ClobClient, Side } from "@polymarket/clob-client";
import { ethers } from "ethers";

// Singleton instance untuk trading client
let clobClient: ClobClient | null = null;

export function getClobClient(): ClobClient {
  if (clobClient) return clobClient;

  const privateKey = process.env.POLYMARKET_PK || process.env.NEXT_PUBLIC_POLYMARKET_PK;
  const host = "https://clob.polymarket.com";
  const chainId = 137; // Polygon Mainnet

  if (!privateKey) {
    throw new Error("POLYMARKET_PK environment variable is required");
  }

  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
  const signer = wallet.connect(provider);

  clobClient = new ClobClient(
    host,
    chainId,
    signer as unknown as ethers.Wallet // Type bypass for ethers v5 compatibility with clob-client
  );

  return clobClient;
}

export async function placeLimitOrder(
  tokenId: string,
  side: "BUY" | "SELL",
  price: number, // 0.01 to 0.99
  size: number
) {
  const client = getClobClient();
  const orderSide = side === "BUY" ? Side.BUY : Side.SELL;
  
  try {
    const order = await client.createOrder({
      tokenID: tokenId,
      price: price,
      side: orderSide,
      size: size,
      feeRateBps: 0, 
      nonce: 0 
    });

    const response = await client.postOrder(order);
    return { success: true, data: response };
  } catch (error) {
    console.error("Failed to place order:", error);
    return { success: false, error: String(error) };
  }
}
