package com.yeditepe.campusapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketItemResponse {
    private Long id;
    private String item;
    private int stock;
}
