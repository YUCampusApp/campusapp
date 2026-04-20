package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.AdjustMarketStockRequest;
import com.yeditepe.campusapp.dto.CreateMarketItemRequest;
import com.yeditepe.campusapp.dto.MarketItemResponse;
import com.yeditepe.campusapp.service.MarketItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketItemService marketItemService;

    private String currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new IllegalStateException("Not authenticated.");
        }
        return userDetails.getUsername();
    }

    @GetMapping("/items")
    public List<MarketItemResponse> listItems() {
        return marketItemService.listAll();
    }

    @PostMapping("/items/admin")
    public MarketItemResponse createItem(@RequestBody CreateMarketItemRequest body) {
        return marketItemService.createAsMarketAdmin(currentPrincipal(), body);
    }

    @PatchMapping("/items/{id}/stock/admin")
    public MarketItemResponse adjustStock(@PathVariable Long id, @RequestBody AdjustMarketStockRequest body) {
        return marketItemService.adjustStockAsMarketAdmin(currentPrincipal(), id, body);
    }

    @DeleteMapping("/items/{id}/admin")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        marketItemService.deleteAsMarketAdmin(currentPrincipal(), id);
        return ResponseEntity.noContent().build();
    }
}
