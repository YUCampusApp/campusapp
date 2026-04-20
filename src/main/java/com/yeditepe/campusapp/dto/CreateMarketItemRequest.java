package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class CreateMarketItemRequest {
    private String item;
    private int stock;
}
