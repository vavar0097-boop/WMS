import { db } from "../../../database/client";

import {
  CreateTransferDto,
  TransferActionDto,
} from "../dto/create-transfer.dto";

import { TransferQueryDto } from "../dto/transfer-query.dto";

import { TransferRepository } from "../repositories/transfer.repository";

export class TransferService {
  constructor(
    private readonly repository =
      new TransferRepository()
  ) {}

  async create(
    dto: CreateTransferDto,
    user: {
      id: string;
    }
  ) {
    const transferNo =
      await this.repository.generateTransferNo();

    const transfer =
      await this.repository.createTransfer(
        dto,
        transferNo,
        user.id
      );

    await this.repository.createTransferItems(
      transfer.id,
      dto.items
    );

    return this.repository.findById(
      transfer.id
    );
  }

  async findMany(
    query: TransferQueryDto
  ) {
    return this.repository.findMany(
      query.page ?? 1,
      query.limit ?? 20,
      query.search,
      query.status
    );
  }

  async findById(id: string) {
    const transfer =
      await this.repository.findById(
        id
      );

    if (!transfer) {
      throw new Error(
        "Transfer not found"
      );
    }

    return transfer;
  }

  async request(
    transferId: string,
    dto: TransferActionDto,
    user: {
      id: string;
    }
  ) {
    const transfer =
      await this.findById(
        transferId
      );

    if (
      transfer.status !== "DRAFT"
    ) {
      throw new Error(
        "Only DRAFT transfer can be requested"
      );
    }

    await this.repository.updateStatus(
      transferId,
      "REQUESTED",
      {
        requested_at:
          new Date().toISOString(),
      }
    );

    await this.repository.createEvent(
      transferId,
      "REQUESTED",
      user.id,
      dto.remarks
    );

    return this.findById(
      transferId
    );
  }

  async pick(
    transferId: string,
    dto: TransferActionDto,
    user: {
      id: string;
    }
  ) {
    const transfer =
      await this.findById(
        transferId
      );

    if (
      transfer.status !==
      "REQUESTED"
    ) {
      throw new Error(
        "Only REQUESTED transfer can be picked"
      );
    }

    const items =
      await this.repository.getTransferItems(
        transferId
      );

    for (const item of items) {
      await db.rpc(
        "create_stock_movement",
        {
          p_item_id:
            item.item_id,

          p_location_id:
            transfer.source_location_id,

          p_movement_type:
            "OUT",

          p_qty:
            item.qty_requested,

          p_reference_type:
            "TRANSFER",

          p_reference_id:
            transferId,
        }
      );

      await this.repository.updateItemShippedQty(
        item.id,
        item.qty_requested
      );
    }

    await this.repository.updateStatus(
      transferId,
      "PICKED",
      {
        approved_by:
          user.id,

        approved_at:
          new Date().toISOString(),
      }
    );

    await this.repository.createEvent(
      transferId,
      "PICKED",
      user.id,
      dto.remarks
    );

    return this.findById(
      transferId
    );
  }

  async dispatch(
    transferId: string,
    dto: TransferActionDto,
    user: {
      id: string;
    }
  ) {
    const transfer =
      await this.findById(
        transferId
      );

    if (
      transfer.status !==
      "PICKED"
    ) {
      throw new Error(
        "Only PICKED transfer can be shipped"
      );
    }

    await this.repository.updateStatus(
      transferId,
      "IN_TRANSIT",
      {
        shipped_at:
          new Date().toISOString(),
      }
    );

    await this.repository.createEvent(
      transferId,
      "SHIPPED",
      user.id,
      dto.remarks
    );

    return this.findById(
      transferId
    );
  }

  async receive(
    transferId: string,
    dto: TransferActionDto,
    user: {
      id: string;
    }
  ) {
    const transfer =
      await this.findById(
        transferId
      );

    if (
      transfer.status !==
      "IN_TRANSIT"
    ) {
      throw new Error(
        "Only IN_TRANSIT transfer can be received"
      );
    }

    const items =
      await this.repository.getTransferItems(
        transferId
      );

    for (const item of items) {
      await db.rpc(
        "create_stock_movement",
        {
          p_item_id:
            item.item_id,

          p_location_id:
            transfer.destination_location_id,

          p_movement_type:
            "IN",

          p_qty:
            item.qty_shipped,

          p_reference_type:
            "TRANSFER",

          p_reference_id:
            transferId,
        }
      );

      await this.repository.updateItemReceivedQty(
        item.id,
        item.qty_shipped
      );
    }

    await this.repository.updateStatus(
      transferId,
      "RECEIVED",
      {
        received_by:
          user.id,

        received_at:
          new Date().toISOString(),
      }
    );

    await this.repository.createEvent(
      transferId,
      "RECEIVED",
      user.id,
      dto.remarks
    );

    return this.findById(
      transferId
    );
  }

  async cancel(
    transferId: string,
    dto: TransferActionDto,
    user: {
      id: string;
    }
  ) {
    const transfer =
      await this.findById(
        transferId
      );

    if (
      ![
        "DRAFT",
        "REQUESTED",
      ].includes(
        transfer.status
      )
    ) {
      throw new Error(
        "Transfer cannot be cancelled"
      );
    }

    await this.repository.updateStatus(
      transferId,
      "CANCELLED"
    );

    await this.repository.createEvent(
      transferId,
      "CANCELLED",
      user.id,
      dto.remarks
    );

    return this.findById(
      transferId
    );
  }
}