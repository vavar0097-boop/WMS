import { BadRequestError } from "../../utils/errors";
import {
  GoogleSheetValues,
  syncGoogleSheet,
} from "../../services/google-sheets.service";
import { GlobalReportRepository } from "./global-report.repository";

const repository = new GlobalReportRepository();

type Row = Record<string, any>;

function dateOnly(value?: string | null) {
  return String(value ?? "").slice(0, 10);
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDateRange(params: {
  date_from?: string;
  date_to?: string;
}) {
  const dateTo =
    params.date_to?.trim() || new Date().toISOString().slice(0, 10);
  const dateFrom =
    params.date_from?.trim() ||
    new Date(Date.parse(`${dateTo}T00:00:00Z`) - 29 * 86400000)
      .toISOString()
      .slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
    throw new BadRequestError("date_from must use YYYY-MM-DD");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    throw new BadRequestError("date_to must use YYYY-MM-DD");
  }

  if (dateFrom > dateTo) {
    throw new BadRequestError("date_from cannot be after date_to");
  }

  return {
    dateFrom,
    dateTo,
  };
}

function paymentTotal(sale: Row, method: "CASH" | "NONCASH") {
  const payments = Array.isArray(sale.sale_payments)
    ? sale.sale_payments
    : [];

  return payments
    .filter((payment) => payment.payment_method === method)
    .reduce((sum, payment) => sum + numberValue(payment.amount), 0);
}

function poTotal(po: Row) {
  const items = Array.isArray(po.purchase_order_items)
    ? po.purchase_order_items
    : [];

  return items.reduce(
    (sum, item) =>
      sum + numberValue(item.qty_ordered) * numberValue(item.unit_price),
    0,
  );
}

function buildSheets(params: {
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  transactions: Row[];
  sales: Row[];
  purchases: Row[];
  settlements: Row[];
  stocks: Row[];
  ledgers: Row[];
  purchaseOrders: Row[];
}) {
  const salesTotal = params.sales
    .filter((sale) => sale.status !== "VOIDED")
    .reduce((sum, sale) => sum + numberValue(sale.grand_total), 0);
  const cashSales = params.sales.reduce(
    (sum, sale) => sum + paymentTotal(sale, "CASH"),
    0,
  );
  const noncashSales = params.sales.reduce(
    (sum, sale) => sum + paymentTotal(sale, "NONCASH"),
    0,
  );
  const income = params.transactions
    .filter((row) => row.type === "INCOME")
    .reduce((sum, row) => sum + numberValue(row.amount), 0);
  const expense = params.transactions
    .filter((row) => row.type === "EXPENSE")
    .reduce((sum, row) => sum + numberValue(row.amount), 0);
  const poOpen = params.purchaseOrders.filter((po) =>
    ["DRAFT", "ORDERED", "PARTIALLY_RECEIVED"].includes(po.status),
  );
  const stockRiskRows = params.stocks.filter((row) => {
    const minStock = numberValue(row.items?.min_stock);

    return minStock > 0 && numberValue(row.quantity) < minStock;
  });
  const poTotalAmount = params.purchaseOrders.reduce(
    (sum, po) => sum + poTotal(po),
    0,
  );
  const poOpenAmount = poOpen.reduce((sum, po) => sum + poTotal(po), 0);
  const saleItems = params.sales.flatMap((sale) =>
    (Array.isArray(sale.sale_items) ? sale.sale_items : []).map(
      (item: Row) => ({
        sale,
        item,
      }),
    ),
  );
  const purchaseItems = params.purchases.flatMap((purchase) =>
    (Array.isArray(purchase.daily_purchase_items)
      ? purchase.daily_purchase_items
      : []
    ).map((item: Row) => ({
      purchase,
      item,
    })),
  );
  const poItems = params.purchaseOrders.flatMap((po) =>
    (Array.isArray(po.purchase_order_items)
      ? po.purchase_order_items
      : []
    ).map((item: Row) => ({
      po,
      item,
    })),
  );

  const sheets: Record<string, GoogleSheetValues> = {
    GR_Summary: [
      ["Metric", "Value"],
      ["Date From", params.dateFrom],
      ["Date To", params.dateTo],
      ["Generated At", params.generatedAt],
      ["Sales Total", salesTotal],
      ["Cash Sales", cashSales],
      ["Noncash Sales", noncashSales],
      ["Sales Count", params.sales.length],
      ["Finance Income", income],
      ["Finance Expense", expense],
      ["Finance Balance", income - expense],
      ["PO Count", params.purchaseOrders.length],
      ["PO Total Amount", poTotalAmount],
      ["Open PO Count", poOpen.length],
      ["Open PO Amount", poOpenAmount],
      ["Stock Rows", params.stocks.length],
      ["Low Stock Rows", stockRiskRows.length],
      ["Daily Purchase Count", params.purchases.length],
      ["Cashier Session Count", params.settlements.length],
    ],
    GR_KPI: [
      ["KPI", "Value", "Unit"],
      ["Gross Sales", salesTotal, "IDR"],
      ["Average Ticket", params.sales.length ? salesTotal / params.sales.length : 0, "IDR"],
      ["Cash Ratio", salesTotal ? cashSales / salesTotal : 0, "ratio"],
      ["Noncash Ratio", salesTotal ? noncashSales / salesTotal : 0, "ratio"],
      ["Expense Ratio", salesTotal ? expense / salesTotal : 0, "ratio"],
      ["Open PO Amount", poOpenAmount, "IDR"],
      ["Low Stock Rate", params.stocks.length ? stockRiskRows.length / params.stocks.length : 0, "ratio"],
    ],
    GR_Sales: [
      [
        "sale_date",
        "created_at",
        "sale_no",
        "outlet_code",
        "outlet_name",
        "cashier",
        "status",
        "subtotal",
        "discount_total",
        "tax_total",
        "grand_total",
        "cash_amount",
        "noncash_amount",
      ],
      ...params.sales.map((sale) => [
        dateOnly(sale.created_at),
        sale.created_at ?? "",
        sale.sale_no ?? "",
        sale.location?.code ?? "",
        sale.location?.name ?? "",
        sale.cashier?.full_name || sale.cashier?.username || "",
        sale.status ?? "",
        numberValue(sale.subtotal),
        numberValue(sale.discount_total),
        numberValue(sale.tax_total),
        numberValue(sale.grand_total),
        paymentTotal(sale, "CASH"),
        paymentTotal(sale, "NONCASH"),
      ]),
    ],
    GR_Sales_Items: [
      [
        "sale_date",
        "sale_no",
        "item_code",
        "item_name",
        "unit",
        "qty",
        "unit_price",
        "subtotal",
      ],
      ...saleItems.map(({ sale, item }) => [
        dateOnly(sale.created_at),
        sale.sale_no ?? "",
        item.item_code_snapshot ?? "",
        item.item_name_snapshot ?? "",
        item.unit_name_snapshot ?? "",
        numberValue(item.quantity),
        numberValue(item.unit_price),
        numberValue(item.subtotal),
      ]),
    ],
    GR_Finance: [
      [
        "transaction_date",
        "type",
        "category",
        "description",
        "amount",
        "payment_method",
        "reference_type",
      ],
      ...params.transactions.map((row) => [
        row.transaction_date ?? "",
        row.type ?? "",
        row.category ?? "",
        row.description ?? "",
        numberValue(row.amount),
        row.payment_method ?? "",
        row.reference_type ?? "",
      ]),
    ],
    GR_Daily_Purchases: [
      [
        "purchase_date",
        "vendor_name",
        "outlet_code",
        "outlet_name",
        "status",
        "total_amount",
        "item_name",
        "qty",
        "unit",
        "unit_price",
        "subtotal",
        "category",
      ],
      ...purchaseItems.map(({ purchase, item }) => [
        purchase.purchase_date ?? "",
        purchase.vendor_name ?? "",
        purchase.outlet?.code ?? "",
        purchase.outlet?.name ?? "",
        purchase.status ?? "",
        numberValue(purchase.total_amount),
        item.item_name ?? "",
        numberValue(item.qty),
        item.unit ?? "",
        numberValue(item.unit_price),
        numberValue(item.subtotal),
        item.category ?? "",
      ]),
    ],
    GR_Stock: [
      [
        "warehouse_code",
        "warehouse_name",
        "location_code",
        "location_name",
        "location_type",
        "item_code",
        "item_name",
        "item_type",
        "unit",
        "quantity",
        "min_stock",
        "reorder_qty",
        "default_vendor",
        "stock_status",
        "updated_at",
      ],
      ...params.stocks.map((row) => {
        const minStock = numberValue(row.items?.min_stock);
        const quantity = numberValue(row.quantity);

        return [
          row.locations?.warehouses?.code ?? "",
          row.locations?.warehouses?.name ?? "",
          row.locations?.code ?? "",
          row.locations?.name ?? "",
          row.locations?.level ?? "",
          row.items?.item_code ?? "",
          row.items?.item_name ?? "",
          row.items?.item_type ?? "",
          row.items?.units?.code ?? "",
          quantity,
          minStock,
          numberValue(row.items?.reorder_qty),
          row.items?.default_vendor_name ?? "",
          minStock > 0 && quantity < minStock ? "LOW_STOCK" : "OK",
          row.updated_at ?? "",
        ];
      }),
    ],
    GR_Stock_Ledger: [
      [
        "created_at",
        "movement_type",
        "item_code",
        "item_name",
        "location_code",
        "location_name",
        "quantity",
        "reference_type",
        "reference_no",
        "remarks",
      ],
      ...params.ledgers.map((row) => [
        row.created_at ?? "",
        row.movement_type ?? "",
        row.items?.item_code ?? "",
        row.items?.item_name ?? "",
        row.locations?.code ?? "",
        row.locations?.name ?? "",
        numberValue(row.quantity),
        row.reference_type ?? "",
        row.reference_no ?? "",
        row.remarks ?? "",
      ]),
    ],
    GR_PO: [
      [
        "order_date",
        "po_no",
        "vendor_name",
        "vendor_code",
        "destination_code",
        "destination_name",
        "status",
        "source_type",
        "expected_date",
        "po_total",
        "created_at",
      ],
      ...params.purchaseOrders.map((po) => [
        po.order_date ?? "",
        po.po_no ?? "",
        po.vendor_name ?? "",
        po.vendors?.vendor_code ?? "",
        po.destination?.code ?? "",
        po.destination?.name ?? "",
        po.status ?? "",
        po.source_type ?? "",
        po.expected_date ?? "",
        poTotal(po),
        po.created_at ?? "",
      ]),
    ],
    GR_PO_Items: [
      [
        "order_date",
        "po_no",
        "vendor_name",
        "status",
        "item_code",
        "item_name",
        "qty_ordered",
        "qty_received",
        "qty_open",
        "unit_price",
        "line_total",
      ],
      ...poItems.map(({ po, item }) => [
        po.order_date ?? "",
        po.po_no ?? "",
        po.vendor_name ?? "",
        po.status ?? "",
        item.items?.item_code ?? "",
        item.items?.item_name ?? "",
        numberValue(item.qty_ordered),
        numberValue(item.qty_received),
        Math.max(
          numberValue(item.qty_ordered) - numberValue(item.qty_received),
          0,
        ),
        numberValue(item.unit_price),
        numberValue(item.qty_ordered) * numberValue(item.unit_price),
      ]),
    ],
    GR_Cashier: [
      [
        "opened_date",
        "session_no",
        "shift_name",
        "status",
        "cashier_name",
        "location_name",
        "opening_cash",
        "total_sales",
        "expected_cash",
        "actual_cash",
        "cash_difference",
      ],
      ...params.settlements.map((row) => [
        dateOnly(row.opened_at),
        row.session_no ?? "",
        row.shift_name ?? "",
        row.status ?? "",
        row.cashier_name ?? row.cashier_username ?? "",
        row.location_name ?? row.location_code ?? "",
        numberValue(row.opening_cash),
        numberValue(row.total_sales),
        numberValue(row.calculated_expected_cash),
        numberValue(row.actual_cash),
        numberValue(row.cash_difference),
      ]),
    ],
  };

  return sheets;
}

export class GlobalReportService {
  async generate(params: {
    date_from?: string;
    date_to?: string;
    sync_google?: boolean;
  }) {
    const { dateFrom, dateTo } = normalizeDateRange(params);
    const generatedAt = new Date().toISOString();
    const [
      transactions,
      sales,
      purchases,
      settlements,
      stocks,
      ledgers,
      purchaseOrders,
    ] = await Promise.all([
      repository.getFinanceTransactions({ dateFrom, dateTo }),
      repository.getSales({ dateFrom, dateTo }),
      repository.getDailyPurchases({ dateFrom, dateTo }),
      repository.getCashierSettlements({ dateFrom, dateTo }),
      repository.getCurrentStocks(),
      repository.getStockLedgers({ dateFrom, dateTo }),
      repository.getPurchaseOrders({ dateFrom, dateTo }),
    ]);

    const sheets = buildSheets({
      dateFrom,
      dateTo,
      generatedAt,
      transactions,
      sales,
      purchases,
      settlements,
      stocks,
      ledgers,
      purchaseOrders,
    });
    const google = params.sync_google
      ? await syncGoogleSheet({ sheets })
      : {
          synced: false,
          reason: "Sync not requested",
        };

    return {
      date_from: dateFrom,
      date_to: dateTo,
      generated_at: generatedAt,
      summary: {
        sheet_count: Object.keys(sheets).length,
        sales_count: sales.length,
        purchase_order_count: purchaseOrders.length,
        stock_rows: stocks.length,
        finance_transaction_count: transactions.length,
      },
      sheets,
      google,
    };
  }
}
