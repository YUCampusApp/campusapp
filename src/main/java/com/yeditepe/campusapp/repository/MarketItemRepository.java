package com.yeditepe.campusapp.repository;

import com.yeditepe.campusapp.entity.MarketItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketItemRepository extends JpaRepository<MarketItem, Long> {
    List<MarketItem> findAllByOrderByIdAsc();
}
