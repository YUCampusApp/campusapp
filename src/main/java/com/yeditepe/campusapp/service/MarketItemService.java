package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.AdjustMarketStockRequest;
import com.yeditepe.campusapp.dto.CreateMarketItemRequest;
import com.yeditepe.campusapp.dto.MarketItemResponse;
import com.yeditepe.campusapp.entity.Admin;
import com.yeditepe.campusapp.entity.AdminServiceRole;
import com.yeditepe.campusapp.entity.MarketItem;
import com.yeditepe.campusapp.entity.Student;
import com.yeditepe.campusapp.entity.User;
import com.yeditepe.campusapp.repository.MarketItemRepository;
import com.yeditepe.campusapp.repository.StudentRepository;
import com.yeditepe.campusapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketItemService {

    private final MarketItemRepository marketItemRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public List<MarketItemResponse> listAll() {
        return marketItemRepository.findAllByOrderByIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional
    public MarketItemResponse createAsMarketAdmin(String principal, CreateMarketItemRequest req) {
        requireMarketAdmin(principal);
        String name = req.getItem() == null ? "" : req.getItem().trim();
        if (name.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item name is required.");
        }
        if (req.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative.");
        }
        MarketItem row = new MarketItem();
        row.setItem(name);
        row.setStock(req.getStock());
        return toDto(marketItemRepository.save(row));
    }

    @Transactional
    public MarketItemResponse adjustStockAsMarketAdmin(String principal, Long id, AdjustMarketStockRequest body) {
        requireMarketAdmin(principal);
        int delta = body.getDelta();
        if (delta != 1 && delta != -1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delta must be 1 or -1.");
        }
        MarketItem row = marketItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found."));
        int next = row.getStock() + delta;
        if (next < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative.");
        }
        row.setStock(next);
        return toDto(marketItemRepository.save(row));
    }

    @Transactional
    public void deleteAsMarketAdmin(String principal, Long id) {
        requireMarketAdmin(principal);
        if (!marketItemRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found.");
        }
        marketItemRepository.deleteById(id);
    }

    private void requireMarketAdmin(String principal) {
        User user = resolvePrincipalUser(principal);
        if (!(user instanceof Admin admin) || admin.getServiceRole() != AdminServiceRole.Market) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only market admins can access this endpoint.");
        }
    }

    private User resolvePrincipalUser(String principal) {
        Student byNo = studentRepository.findByStudentNo(principal);
        if (byNo != null) {
            return byNo;
        }
        Student byEmail = studentRepository.findByEmail(principal);
        if (byEmail != null) {
            return byEmail;
        }
        return userRepository.findByEmail(principal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));
    }

    private MarketItemResponse toDto(MarketItem row) {
        return new MarketItemResponse(row.getId(), row.getItem(), row.getStock());
    }
}
