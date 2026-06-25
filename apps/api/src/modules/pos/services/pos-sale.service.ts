import { BadRequestError } from "../../../utils/errors";
import { CashierSessionRepository } from "../../cashier-sessions/repositories/cashier-session.repository";
import { StockRepository } from "../../stocks/repositories/stock.repository";

import {
  CreatePosSaleDto,
  VoidPosSaleDto,
} from "../dto/pos-sale.dto";
import { PosSaleRepository } from "../repositories/pos-sale.repository";
import { PosMenuItemRow, PosSaleSummary } from "../types/pos-sale.type";

const cashierSessionRepository = new CashierSessionRepository();
const posSaleRepository = new PosSaleRepository();
const stockRepository = new StockRepository();

function numberValue(value: unknown) {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
}

function getUnitName(menuItem: PosMenuItemRow) {
  return (
    menuItem.items?.units?.name ||
    menuItem.items?.units?.code ||
    null
  );
}

function aggregateQuantities(
  items: Array<{
    itemId: string;
    quantity: number;
  }>,
) {
  const quantityByItem = new Map<string, number>();

  for (const item of items) {
    quantityByItem.set(
      item.itemId,
      (quantityByItem.get(item.itemId) ?? 0) + item.quantity,
    );
  }

  return quantityByItem;
}

export class PosSaleService {
  async getMenu(params?: {
    search?: string;
    limit?: number;
    cashierId?: string;
  }) {
    const menuItems = await posSaleRepository.findMenuItems({
      ...params,
      availableOnly: true,
    });

    if (!params?.cashierId) {
      return menuItems;
    }

    const activeSession =
      await cashierSessionRepository.findOpenSessionByCashierId(
        params.cashierId,
      );

    if (!activeSession) {
      return menuItems.map((item) => ({
        ...item,
        current_stock: null,
        is_low_stock: false,
      }));
    }

    return Promise.all(
      menuItems.map(async (item) => {
        if (!item.item_id) {
          return {
            ...item,
            current_stock: null,
            is_low_stock: false,
          };
        }

        const currentStock = numberValue(
          await stockRepository.getCurrentStock(
            item.item_id,
            activeSession.location_id,
          ),
        );

        return {
          ...item,
          current_stock: currentStock,
          is_low_stock: currentStock > 0 && currentStock <= 5,
        };
      }),
    );
  }

  async getOutlets() {
    return posSaleRepository.findOutletLocations();
  }

  async createSale(
    cashierId: string,
    dto: CreatePosSaleDto,
  ): Promise<PosSaleSummary> {
    const activeSession =
      await cashierSessionRepository.findOpenSessionByCashierId(
        cashierId,
      );

    if (!activeSession) {
      throw new BadRequestError(
        "Open cashier session is required before selling",
      );
    }

    const uniqueMenuIds = [
      ...new Set(dto.items.map((item) => item.menu_item_id)),
    ];

    const menuItems =
      await posSaleRepository.findMenuItemsByIds(uniqueMenuIds);

    const menuMap = new Map(
      menuItems.map((item) => [item.id, item]),
    );

    const saleItems = dto.items.map((requestedItem) => {
      const menuItem = menuMap.get(requestedItem.menu_item_id);

      if (!menuItem) {
        throw new BadRequestError("Menu item is not available");
      }

      if (!menuItem.item_id || !menuItem.items) {
        throw new BadRequestError(
          `${menuItem.menu_name} is not linked to an inventory item`,
        );
      }

      const quantity = numberValue(requestedItem.quantity);
      const unitPrice = numberValue(menuItem.price);
      const subtotal = quantity * unitPrice;

      return {
        menuItem,
        itemId: menuItem.item_id,
        quantity,
        unitPrice,
        subtotal,
      };
    });

    const quantityByItem = aggregateQuantities(
      saleItems.map((item) => ({
        itemId: item.itemId as string,
        quantity: item.quantity,
      })),
    );

    for (const [itemId, quantity] of quantityByItem) {
      const currentStock = numberValue(
        await stockRepository.getCurrentStock(
          itemId,
          activeSession.location_id,
        ),
      );

      if (currentStock < quantity) {
        const itemName =
          saleItems.find((item) => item.itemId === itemId)
            ?.menuItem.items?.item_name ?? "selected item";

        throw new BadRequestError(
          `Insufficient stock for ${itemName}`,
        );
      }
    }

    const subtotal = saleItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const grandTotal = subtotal;
    const paidAmount = numberValue(dto.paid_amount);

    if (paidAmount < grandTotal) {
      throw new BadRequestError(
        "Paid amount cannot be less than grand total",
      );
    }

    const sale = await posSaleRepository.createSale({
      cashierSessionId: activeSession.cashier_session_id,
      cashierId,
      locationId: activeSession.location_id,
      subtotal,
      grandTotal,
    });

    await posSaleRepository.createSaleItems(
      saleItems.map((item) => ({
        saleId: sale.id,
        itemId: item.itemId as string,
        itemCodeSnapshot: item.menuItem.items?.item_code ?? "",
        itemNameSnapshot:
          item.menuItem.items?.item_name || item.menuItem.menu_name,
        unitNameSnapshot: getUnitName(item.menuItem),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    );

    for (const item of saleItems) {
      await stockRepository.createStockMovement({
        item_id: item.itemId as string,
        location_id: activeSession.location_id,
        movement_type: "OUT",
        quantity: item.quantity,
        reference_type: "SALE",
        reference_id: sale.id,
        reference_no: sale.sale_no,
        remarks: "POS sale",
        created_by: cashierId,
        stock_effect: "MINUS",
      });
    }

    await posSaleRepository.createPayment({
      saleId: sale.id,
      paymentMethod: dto.payment_method,
      amount: grandTotal,
      referenceNo: dto.reference_no,
    });

    await posSaleRepository.createFinanceTransaction({
      saleId: sale.id,
      amount: grandTotal,
      paymentMethod: dto.payment_method,
      cashierId,
    });

    return {
      sale_id: sale.id,
      sale_no: sale.sale_no,
      cashier_session_id: activeSession.cashier_session_id,
      subtotal,
      discount_total: 0,
      tax_total: 0,
      grand_total: grandTotal,
      payment_method: dto.payment_method,
      paid_amount: paidAmount,
      change_amount: paidAmount - grandTotal,
    };
  }

  async voidSale(
    cashierId: string,
    saleId: string,
    dto: VoidPosSaleDto,
  ) {
    const sale = await posSaleRepository.findSaleById(saleId);

    posSaleRepository.assertSaleFound(sale);

    if (sale.status !== "PAID") {
      throw new BadRequestError("Only paid sale can be voided");
    }

    const saleItems = Array.isArray(sale.sale_items)
      ? sale.sale_items
      : [];

    for (const item of saleItems) {
      await stockRepository.createStockMovement({
        item_id: item.item_id,
        location_id: sale.location_id,
        movement_type: "IN",
        quantity: numberValue(item.quantity),
        reference_type: "SALE",
        reference_id: sale.id,
        reference_no: sale.sale_no,
        remarks: `Void sale: ${dto.reason}`,
        created_by: cashierId,
        stock_effect: "PLUS",
      });
    }

    const voided = await posSaleRepository.voidSale({
      saleId,
      reason: dto.reason,
    });

    await posSaleRepository.createVoidFinanceTransaction({
      saleId,
      amount: numberValue(sale.grand_total),
      cashierId,
      reason: dto.reason,
    });

    return voided;
  }
}
