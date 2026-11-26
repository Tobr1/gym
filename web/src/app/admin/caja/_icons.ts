import { Banknote, CreditCard, Landmark, QrCode, WalletCards } from "lucide-react";
import type { MethodKey } from "./_data";

export const METHOD_ICON: Record<MethodKey, typeof Banknote> = {
  efectivo: Banknote,
  debito: CreditCard,
  credito: WalletCards,
  transferencia: Landmark,
  mp: QrCode,
};
