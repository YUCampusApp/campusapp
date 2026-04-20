package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class AdjustMarketStockRequest {
    /** Expected values: 1 or -1 */
    private int delta;
}
