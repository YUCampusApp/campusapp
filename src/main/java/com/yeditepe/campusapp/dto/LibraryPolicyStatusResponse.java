package com.yeditepe.campusapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LibraryPolicyStatusResponse {
    private boolean reservationBlocked;
    /** ISO-8601 instant when the block ends, if blocked */
    private String blockedUntil;
    private String message;
}
