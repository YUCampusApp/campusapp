package com.yeditepe.campusapp.dto;

import com.yeditepe.campusapp.entity.LibrarySectionType;
import lombok.Data;

@Data
public class LibrarySectionStatusResponse {
    private LibrarySectionType sectionType;
    private int totalSeats;
    private int availableSeats;
    private boolean full;
}
