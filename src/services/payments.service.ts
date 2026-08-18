import { apiClient } from "@/lib/api-client";
import { createCrudService } from "./crud-service";
import type { CreatePaymentDto, DebtorRow, Payment, PaymentStats } from "@/types/payment";

const base = createCrudService<Payment, CreatePaymentDto>("payments");

export const paymentsService = {
  ...base,
  stats: async () => {
    const res = await apiClient.get<PaymentStats>("/payments/stats");
    return res.data;
  },
  debtors: async () => {
    const res = await apiClient.get<DebtorRow[]>("/payments/debtors");
    return res.data;
  },
  refund: async (id: string) => {
    const res = await apiClient.post<Payment>(`/payments/${id}/refund`);
    return res.data;
  },
};
